import prisma from '../config/db';

export class SettingsService {
  async getSystemSettings(tenantId: string) {
    const list = await prisma.systemSetting.findMany({
      where: { tenantId },
    });
    return list;
  }

  async saveSystemSetting(tenantId: string, key: string, value: string) {
    const existing = await prisma.systemSetting.findFirst({
      where: { tenantId, key },
    });

    if (existing) {
      return prisma.systemSetting.update({
        where: { id: existing.id },
        data: { value },
      });
    }

    return prisma.systemSetting.create({
      data: { tenantId, key, value },
    });
  }

  async getMaintenanceMode(tenantId: string) {
    const maintenance = await prisma.maintenanceWindow.findFirst({
      where: { tenantId, isActive: true },
    });
    return maintenance;
  }

  async toggleMaintenanceMode(tenantId: string, isActive: boolean, description?: string) {
    // Disable active ones
    await prisma.maintenanceWindow.updateMany({
      where: { tenantId },
      data: { isActive: false },
    });

    if (isActive) {
      return prisma.maintenanceWindow.create({
        data: {
          tenantId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000), // 1 hour duration default
          description: description || 'Routine administrative maintenance window.',
          isActive: true,
        },
      });
    }

    return null;
  }
}

export default new SettingsService();
export const settingsService = new SettingsService();
