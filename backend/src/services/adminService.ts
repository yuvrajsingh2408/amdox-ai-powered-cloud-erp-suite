import prisma from '../config/db';

export class AdminService {
  async getEnvVariables(tenantId: string) {
    const count = await prisma.environmentVariable.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.environmentVariable.createMany({
        data: [
          { tenantId, envKey: 'DATABASE_URL', envVal: 'file:./dev.db' },
          { tenantId, envKey: 'REDIS_URL', envVal: 'redis://localhost:6379' },
          { tenantId, envKey: 'NODE_ENV', envVal: 'production' },
        ],
      });
    }
    return prisma.environmentVariable.findMany({ where: { tenantId } });
  }

  async saveEnvVariable(tenantId: string, key: string, val: string) {
    const existing = await prisma.environmentVariable.findFirst({
      where: { tenantId, envKey: key },
    });

    if (existing) {
      return prisma.environmentVariable.update({
        where: { id: existing.id },
        data: { envVal: val },
      });
    }

    return prisma.environmentVariable.create({
      data: { tenantId, envKey: key, envVal: val },
    });
  }
}

export default new AdminService();
export const adminService = new AdminService();
