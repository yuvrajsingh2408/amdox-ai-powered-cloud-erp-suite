import prisma from '../config/db';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class TicketService {
  async getTickets(tenantId: string, portalType: string, portalUserId: string) {
    return prisma.supportTicket.findMany({
      where: { tenantId, portalType, portalUserId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketDetails(tenantId: string, ticketId: string) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId, deletedAt: null },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!ticket) throw new NotFoundError('Support ticket details not found');
    return ticket;
  }

  async createTicket(
    tenantId: string,
    portalType: string,
    portalUserId: string,
    data: { category: string; priority: string; subject: string; description: string }
  ) {
    if (!data.subject || !data.description || !data.category || !data.priority) {
      throw new BadRequestError('Subject, description, category, and priority are required fields');
    }

    return prisma.supportTicket.create({
      data: {
        tenantId,
        portalType,
        portalUserId,
        category: data.category,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        status: 'OPEN',
      },
    });
  }

  async addReply(
    tenantId: string,
    ticketId: string,
    sender: { senderType: 'PORTAL_USER' | 'ERP_USER'; senderId: string; senderName: string },
    message: string
  ) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId, deletedAt: null },
    });

    if (!ticket) throw new NotFoundError('Support ticket not found');

    return prisma.$transaction(async (tx) => {
      // Create reply
      const reply = await tx.ticketReply.create({
        data: {
          ticketId,
          senderType: sender.senderType,
          senderId: sender.senderId,
          senderName: sender.senderName,
          message,
        },
      });

      // Update parent ticket status
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: sender.senderType === 'PORTAL_USER' ? 'OPEN' : 'IN_PROGRESS',
        },
      });

      return reply;
    });
  }

  async closeTicket(tenantId: string, ticketId: string, rating?: number) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId, deletedAt: null },
    });

    if (!ticket) throw new NotFoundError('Support ticket not found');

    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        rating: rating || null,
        resolutionTime: 12, // mock value in hours
      },
    });
  }

  async getAISuggestedReply(ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundError('Ticket mapping not found');

    return {
      ticketId,
      suggestedReply: 'Suggested Resolution: Standard delivery lead times for SCM orders is 3 working days. Your shipment is currently loading at terminal 2.',
    };
  }
}

export default new TicketService();
export const ticketService = new TicketService();
