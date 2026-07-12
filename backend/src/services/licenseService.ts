import prisma from '../config/db';

export class LicenseService {
  async getPlans() {
    const count = await prisma.subscriptionPlan.count();
    if (count === 0) {
      await prisma.subscriptionPlan.createMany({
        data: [
          { name: 'Starter Enterprise', price: 99.0, seatLimit: 5, storageGb: 10, aiCredits: 100, apiLimit: 10000 },
          { name: 'Growth Professional', price: 299.0, seatLimit: 25, storageGb: 100, aiCredits: 500, apiLimit: 50000 },
          { name: 'Scale Unlimited', price: 999.0, seatLimit: 999, storageGb: 1000, aiCredits: 2000, apiLimit: 500000 },
        ],
      });
    }
    return prisma.subscriptionPlan.findMany();
  }

  async getLicense(tenantId: string) {
    let license = await prisma.license.findFirst({
      where: { tenantId },
      include: { usages: true },
    });

    if (!license) {
      license = await prisma.license.create({
        data: {
          tenantId,
          planName: 'Growth Professional',
          seatLimit: 25,
          storageLimit: 100000000000n, // 100 GB in bytes
          apiLimit: 50000,
          expiresAt: new Date(Date.now() + 31536000000), // 1 year expiration
        },
        include: { usages: true },
      });
    }

    return license;
  }
}

export default new LicenseService();
export const licenseService = new LicenseService();
