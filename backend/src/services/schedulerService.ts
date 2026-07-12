import prisma from '../config/db';

export class SchedulerService {
  async getCronJobs(tenantId: string) {
    const count = await prisma.cronJob.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.cronJob.create({
        data: {
          tenantId,
          name: 'Fulfillment Overdue Invoices Alert',
          cronExpr: '0 0 * * *',
          nextRun: new Date(Date.now() + 86400000),
        },
      });
    }
    return prisma.cronJob.findMany({ where: { tenantId } });
  }

  async getQueueJobs(tenantId: string) {
    const count = await prisma.queueJob.count({ where: { tenantId } });
    if (count === 0) {
      await prisma.queueJob.create({
        data: {
          tenantId,
          queueName: 'PDF_REPORT_COMPILER_QUEUE',
          payload: '{"reportId": "rep-901"}',
          attempts: 1,
          status: 'QUEUED',
        },
      });
    }
    return prisma.queueJob.findMany({ where: { tenantId } });
  }
}

export default new SchedulerService();
export const schedulerService = new SchedulerService();
