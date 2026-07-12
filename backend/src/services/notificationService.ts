import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class NotificationService {
  // --- Smart Priority Classifier ---
  classifyPriority(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('critical') || msg.includes('fail') || msg.includes('overdue') || msg.includes('urgent') || msg.includes('breach')) {
      return 'CRITICAL';
    }
    if (msg.includes('warning') || msg.includes('reorder') || msg.includes('pending approval') || msg.includes('limit')) {
      return 'HIGH';
    }
    if (msg.includes('success') || msg.includes('approved') || msg.includes('completed') || msg.includes('welcome')) {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  // --- Dispatch Core (Multi-channel & Preferences checking) ---
  async dispatchNotification(
    tenantId: string,
    userId: string,
    title: string,
    message: string,
    type: string = 'INFO',
    templateCode?: string,
    templateVariables?: Record<string, string>
  ) {
    // 1. Get or Create user preferences
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId_tenantId: { userId, tenantId } }
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId, tenantId }
      });
    }

    // 2. Resolve template if templateCode is provided
    let subject = title;
    let finalBody = message;

    if (templateCode) {
      const template = await prisma.notificationTemplate.findFirst({
        where: { name: templateCode, tenantId }
      });
      if (template) {
        subject = this.compileTemplate(template.subject, templateVariables || {});
        finalBody = this.compileTemplate(template.content, templateVariables || {});
      }
    }

    const priority = this.classifyPriority(finalBody);

    // 3. Fetch user email (for Email channel)
    const userObj = await prisma.user.findFirst({ where: { id: userId, tenantId } });
    const userEmail = userObj?.email;
    const userPhone = userObj && 'phone' in userObj ? (userObj as any).phone as string : undefined;

    // 4. In-App Notification (default)
    if (prefs.inAppEnabled) {
      await prisma.notification.create({
        data: {
          userId,
          title: subject,
          message: finalBody,
          type,
          priority,
          readStatus: 'UNREAD',
          deliveryStatus: 'DELIVERED',
          channel: 'IN_APP',
          tenantId
        }
      });
    }

    // 5. Queue Email
    if (prefs.emailEnabled && userEmail) {
      await prisma.emailQueue.create({
        data: {
          to: userEmail,
          subject,
          body: finalBody,
          tenantId
        }
      });
    }

    // 6. Queue SMS
    if (prefs.smsEnabled && userPhone) {
      await prisma.sMSQueue.create({
        data: {
          to: userPhone,
          message: finalBody,
          tenantId
        }
      });
    }

    // 7. Queue Push
    if (prefs.pushEnabled) {
      await prisma.pushNotification.create({
        data: {
          userId,
          title: subject,
          message: finalBody,
          tenantId
        }
      });
    }

    return { success: true, priority };
  }

  // --- Compile template placeholders ---
  private compileTemplate(text: string, vars: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
    }
    return result;
  }

  // --- User Fetch & Actions ---
  async getNotifications(tenantId: string, userId: string, page?: number, limit?: number) {
    const options: any = {
      where: { userId, tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    };
    if (page || limit) {
      const p = page || 1;
      const l = limit || 20;
      options.skip = (p - 1) * l;
      options.take = l;
    } else {
      options.take = 100;
    }
    return prisma.notification.findMany(options);
  }

  async markRead(tenantId: string, userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId, tenantId },
      data: { isRead: true, readStatus: 'READ' }
    });
  }

  async markAllRead(tenantId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true, readStatus: 'READ' }
    });
  }

  async deleteNotification(tenantId: string, userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId, tenantId },
      data: { deletedAt: new Date() }
    });
  }

  // --- User preferences ---
  async getPreferences(tenantId: string, userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId_tenantId: { userId, tenantId } }
    });
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId, tenantId }
      });
    }
    return prefs;
  }

  async updatePreferences(tenantId: string, userId: string, data: Partial<{
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
  }>) {
    return prisma.notificationPreference.upsert({
      where: { userId_tenantId: { userId, tenantId } },
      update: data,
      create: {
        userId,
        tenantId,
        emailEnabled: data.emailEnabled ?? true,
        smsEnabled: data.smsEnabled ?? false,
        pushEnabled: data.pushEnabled ?? true,
        inAppEnabled: data.inAppEnabled ?? true,
      }
    });
  }

  // --- Announcements & BroadCast ---
  async createAnnouncement(tenantId: string, title: string, message: string, createdBy: string, targetRole?: string) {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        targetRole,
        tenantId,
        createdBy
      }
    });

    // Automatically dispatch In-App notifications for all users of target role, or all users if targetRole is null
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(targetRole ? {
          userRoles: {
            some: {
              role: { name: targetRole }
            }
          }
        } : {})
      }
    });

    for (const u of users) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: `Announcement: ${title}`,
          message,
          type: 'ALERT',
          priority: 'HIGH',
          channel: 'IN_APP',
          tenantId
        }
      });
    }

    return announcement;
  }

  async getAnnouncements(tenantId: string, userRole?: string) {
    return prisma.announcement.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          { targetRole: null },
          { targetRole: userRole }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteAnnouncement(tenantId: string, id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // --- Template CRUD ---
  async getTemplates(tenantId: string) {
    return prisma.notificationTemplate.findMany({
      where: { tenantId }
    });
  }

  async saveTemplate(tenantId: string, data: { name: string; subject: string; content: string; channel: string; id?: string }) {
    if (data.id) {
      return prisma.notificationTemplate.update({
        where: { id: data.id },
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          channel: data.channel
        }
      });
    }

    return prisma.notificationTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        channel: data.channel,
        tenantId
      }
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    return prisma.notificationTemplate.delete({
      where: { id }
    });
  }

  // --- Cron / Queue Processing (Triggered every 30s) ---
  async processNotificationQueues() {
    try {
      // 1. Process Email Queue
      const pendingEmails = await prisma.emailQueue.findMany({
        where: { status: 'PENDING' },
        take: 10
      });

      for (const email of pendingEmails) {
        try {
          logger.info(`[MailSender] Sending out email to: ${email.to}. Subject: ${email.subject}`);
          // Simulate network SMTP delay
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status: 'SENT',
              attempts: email.attempts + 1
            }
          });
        } catch (err: any) {
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              status: 'FAILED',
              attempts: email.attempts + 1,
              error: err.message || 'SMTP timeout'
            }
          });
        }
      }

      // 2. Process SMS Queue
      const pendingSMS = await prisma.sMSQueue.findMany({
        where: { status: 'PENDING' },
        take: 10
      });

      for (const sms of pendingSMS) {
        try {
          logger.info(`[SMSSender] Texting out to: ${sms.to}. Message: ${sms.message}`);
          await prisma.sMSQueue.update({
            where: { id: sms.id },
            data: {
              status: 'SENT',
              attempts: sms.attempts + 1
            }
          });
        } catch (err: any) {
          await prisma.sMSQueue.update({
            where: { id: sms.id },
            data: {
              status: 'FAILED',
              attempts: sms.attempts + 1,
              error: err.message || 'SMS service unreachable'
            }
          });
        }
      }

      // 3. Process Push notifications
      const pendingPush = await prisma.pushNotification.findMany({
        where: { status: 'PENDING' },
        take: 10
      });

      for (const push of pendingPush) {
        try {
          logger.info(`[PushSender] Sending web push trigger to user: ${push.userId}. Title: ${push.title}`);
          await prisma.pushNotification.update({
            where: { id: push.id },
            data: {
              status: 'SENT'
            }
          });
        } catch (err: any) {
          await prisma.pushNotification.update({
            where: { id: push.id },
            data: {
              status: 'FAILED',
              error: err.message
            }
          });
        }
      }

    } catch (error) {
      logger.error('Error processing notification queues:', error);
    }
  }
}

export default new NotificationService();
export const notificationService = new NotificationService();
