import prisma from '../config/db';

export class TenantService {
  async getTenants() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantDetails(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const usage = await prisma.tenantUsage.findFirst({
      where: { tenantId },
    });

    return {
      tenant,
      usage: usage || {
        usersCount: 8,
        storageBytes: 1540000000n, // BigInt representation
        aiCredits: 50.0,
        apiCalls: 2201,
      },
    };
  }

  async updateTenantStatus(tenantId: string, status: 'ACTIVE' | 'INACTIVE') {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }
}

export default new TenantService();
export const tenantService = new TenantService();
