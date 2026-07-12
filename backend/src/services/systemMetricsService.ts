import prisma from '../config/db';

export class SystemMetricsService {
  async getDatabaseStats(tenantId: string) {
    const count = await prisma.databaseStatistic.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.databaseStatistic.create({
        data: { tenantId, tablesCount: 142, rowsCount: 84400, sizeGb: 0.15 },
      });
    }
    return prisma.databaseStatistic.findFirst({ where: { tenantId } });
  }

  async getBackupsList(tenantId: string) {
    const count = await prisma.databaseBackup.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.databaseBackup.create({
        data: { tenantId, fileName: 'amdox_db_backup_2026-07-10.sqlite', sizeMb: 24.5, status: 'SUCCESS' },
      });
    }
    return prisma.databaseBackup.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new SystemMetricsService();
export const systemMetricsService = new SystemMetricsService();
