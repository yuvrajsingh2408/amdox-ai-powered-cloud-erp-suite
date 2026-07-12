import prisma from '../config/db';
import logger from '../utils/logger';

export class KnowledgeBaseService {
  async getArticles(tenantId: string, category?: string, search?: string) {
    // Seed sample articles if none exist
    const count = await prisma.knowledgeBaseArticle.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.knowledgeBaseArticle.createMany({
        data: [
          { tenantId, category: 'FAQ', title: 'How to download billing invoices?', content: 'Navigate to Invoices portal link. Select invoice and click Print/Download.' },
          { tenantId, category: 'MANUAL', title: 'Supplier registration guidelines', content: 'Vendors must upload verified business registration license and tax certification documents.' },
          { tenantId, category: 'FINANCE', title: 'Payment terms allocation', content: 'Invoice billing schedules are processed under net-30 terms parameters.' },
        ],
      });
    }

    const where: any = { tenantId, deletedAt: null };
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    return prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getArticleDetails(tenantId: string, id: string) {
    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (article) {
      // Increment views count
      await prisma.knowledgeBaseArticle.update({
        where: { id },
        data: { views: article.views + 1 },
      });
    }
    return article;
  }
}

export default new KnowledgeBaseService();
export const knowledgeBaseService = new KnowledgeBaseService();
