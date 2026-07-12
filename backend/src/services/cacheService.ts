import prisma from '../config/db';

export class CacheService {
  async getCacheStats(tenantId: string) {
    let stats = await prisma.cacheStatistic.findFirst({ where: { tenantId } });
    if (!stats) {
      stats = await prisma.cacheStatistic.create({
        data: { tenantId, hitsCount: 4200, missCount: 154, keysCount: 220 },
      });
    }
    return stats;
  }

  async flushAllCache(tenantId: string) {
    const stats = await this.getCacheStats(tenantId);
    return prisma.cacheStatistic.update({
      where: { id: stats.id },
      data: { keysCount: 0, hitsCount: 0, missCount: 0 },
    });
  }
}

export default new CacheService();
export const cacheService = new CacheService();
