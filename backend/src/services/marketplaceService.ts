import prisma from '../config/db';

export class MarketplaceService {
  async getMarketplacePackages() {
    const count = await prisma.marketplacePackage.count();
    if (count === 0) {
      await prisma.marketplacePackage.createMany({
        data: [
          { name: 'Stripe Billing Advanced Plugin', category: 'FINANCE', price: 49.0, rating: 4.8 },
          { name: 'Active Directory SSO connector', category: 'CORE', price: 99.0, rating: 4.5 },
          { name: 'Zoom Rooms Scheduler addon', category: 'HR', price: 0.0, rating: 4.2 },
        ],
      });
    }
    return prisma.marketplacePackage.findMany();
  }
}

export default new MarketplaceService();
export const marketplaceService = new MarketplaceService();
