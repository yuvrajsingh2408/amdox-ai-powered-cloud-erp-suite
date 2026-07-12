import prisma from '../config/db';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  projectId?: string;
  vendorId?: string;
  customerId?: string;
  financialYear?: string;
  status?: string;
}

export class ReportService {
  // ----------------------------------------------------
  // 1. Run Dynamic Reports Queries
  // ----------------------------------------------------
  async runReportData(tenantId: string, module: string, filters: ReportFilters) {
    const cleanModule = module.toUpperCase();
    const dateStart = filters.startDate ? new Date(filters.startDate) : undefined;
    const dateEnd = filters.endDate ? new Date(filters.endDate) : undefined;

    try {
      switch (cleanModule) {
        case 'HR': {
          const whereClause: any = { tenantId, deletedAt: null };
          if (filters.departmentId) {
            whereClause.departmentId = filters.departmentId;
          }
          if (filters.status) {
            whereClause.status = filters.status;
          }

          const employees = await prisma.employee.findMany({
            where: whereClause,
            include: { department: true },
            orderBy: { employeeCode: 'asc' },
          });

          return employees.map((e) => ({
            employeeCode: e.employeeCode,
            name: `${e.firstName} ${e.lastName}`,
            email: e.email,
            phone: e.phone || 'N/A',
            department: e.department.name,
            designation: e.designation,
            dateOfJoining: new Date(e.dateOfJoining).toLocaleDateString(),
            salary: e.salary,
            status: e.status,
          }));
        }

        case 'FINANCE': {
          const invoiceWhere: any = { tenantId, deletedAt: null };
          if (dateStart || dateEnd) {
            invoiceWhere.issuedDate = {};
            if (dateStart) invoiceWhere.issuedDate.gte = dateStart;
            if (dateEnd) invoiceWhere.issuedDate.lte = dateEnd;
          }
          if (filters.customerId) {
            invoiceWhere.customerId = filters.customerId;
          }
          if (filters.vendorId) {
            invoiceWhere.vendorId = filters.vendorId;
          }

          const invoices = await prisma.invoice.findMany({
            where: invoiceWhere,
            include: { customer: true, vendor: true },
            orderBy: { issuedDate: 'desc' },
          });

          return invoices.map((inv) => ({
            invoiceNumber: inv.invoiceNumber,
            type: inv.type,
            contactName: inv.customer?.name || inv.vendor?.name || 'External client',
            amount: inv.amount,
            tax: inv.tax,
            status: inv.status,
            dueDate: new Date(inv.dueDate).toLocaleDateString(),
            issuedDate: new Date(inv.issuedDate).toLocaleDateString(),
          }));
        }

        case 'SCM': {
          const productWhere: any = { tenantId, deletedAt: null };
          if (filters.status === 'LOW_STOCK') {
            productWhere.quantityInStock = { lte: 15 };
          }

          const products = await prisma.product.findMany({
            where: productWhere,
            include: { warehouse: true },
            orderBy: { sku: 'asc' },
          });

          return products.map((p) => ({
            sku: p.sku,
            name: p.name,
            category: p.category || 'General',
            unitPrice: p.unitPrice,
            quantityInStock: p.quantityInStock,
            reorderLevel: p.reorderLevel,
            warehouse: p.warehouse?.name || 'Main Bin',
            value: p.quantityInStock * p.unitPrice,
          }));
        }

        case 'CRM': {
          const dealWhere: any = { tenantId, deletedAt: null };
          if (filters.status) {
            dealWhere.stage = filters.status;
          }

          const deals = await prisma.deal.findMany({
            where: dealWhere,
            include: { client: true },
            orderBy: { amount: 'desc' },
          });

          return deals.map((d) => ({
            dealName: d.name,
            companyName: d.client.company,
            clientName: d.client.name,
            email: d.client.email,
            amount: d.amount,
            stage: d.stage,
            createdDate: new Date(d.createdAt).toLocaleDateString(),
          }));
        }

        case 'PROJECT': {
          const projectWhere: any = { tenantId, deletedAt: null };
          if (filters.status) {
            projectWhere.status = filters.status;
          }

          const projects = await prisma.project.findMany({
            where: projectWhere,
            include: { tasks: true },
            orderBy: { name: 'asc' },
          });

          return projects.map((p) => ({
            projectName: p.name,
            status: p.status,
            budget: p.budget,
            actualCost: p.actualCost,
            variance: p.budget - p.actualCost,
            startDate: new Date(p.startDate).toLocaleDateString(),
            tasksCount: p.tasks.length,
            completedTasks: p.tasks.filter((t) => t.status === 'DONE').length,
          }));
        }

        case 'AUDIT': {
          const logWhere: any = { tenantId, deletedAt: null };
          if (dateStart || dateEnd) {
            logWhere.createdAt = {};
            if (dateStart) logWhere.createdAt.gte = dateStart;
            if (dateEnd) logWhere.createdAt.lte = dateEnd;
          }

          const logs = await prisma.auditLog.findMany({
            where: logWhere,
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
          });

          return logs.map((l) => ({
            timestamp: new Date(l.createdAt).toLocaleString(),
            userEmail: l.user?.email || 'N/A',
            userName: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System Agent',
            action: l.action,
            module: l.module,
            details: l.details || 'N/A',
            ipAddress: l.ipAddress || '127.0.0.1',
          }));
        }

        default:
          throw new BadRequestError(`Unsupported report module type: ${module}`);
      }
    } catch (error: any) {
      logger.error(`[Report Service] Run report error: ${error.message}`);
      throw error;
    }
  }

  // ----------------------------------------------------
  // 2. Export & Download Mock File Generation
  // ----------------------------------------------------
  async generateExport(
    tenantId: string,
    userId: string,
    data: { reportId?: string; title: string; module: string; filters: string; fileType: string }
  ) {
    try {
      const parsedFilters = JSON.parse(data.filters);
      const rows = await this.runReportData(tenantId, data.module, parsedFilters);

      const timestamp = Date.now();
      const fileName = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${timestamp}.${data.fileType.toLowerCase()}`;
      // Emulate cloud storage url link
      const fileUrl = `/uploads/reports/${fileName}`;

      const exportRecord = await prisma.exportHistory.create({
        data: {
          tenantId,
          reportId: data.reportId || null,
          fileName,
          fileType: data.fileType.toUpperCase(),
          fileUrl,
          status: 'COMPLETED',
          createdBy: userId,
        },
      });

      return {
        exportId: exportRecord.id,
        fileName,
        fileType: exportRecord.fileType,
        fileUrl,
        rowCount: rows.length,
        createdAt: exportRecord.createdAt,
      };
    } catch (error: any) {
      logger.error(`[Report Service] Failed to create export file: ${error.message}`);
      throw error;
    }
  }

  async getExportHistory(tenantId: string) {
    return prisma.exportHistory.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  // ----------------------------------------------------
  // 3. Saved Reports and Predefined Templates
  // ----------------------------------------------------
  async getSavedReports(tenantId: string, page?: number, limit?: number) {
    // Seed default template list if none exist
    const count = await prisma.reportTemplate.count({
      where: { OR: [{ tenantId: null }, { tenantId }] },
    });

    if (count === 0) {
      const systemTemplates = [
        {
          title: 'Workforce Roster Report',
          module: 'HR',
          description: 'Overview lists of active employees, designations, and department fields.',
          filters: JSON.stringify({ status: 'ACTIVE' }),
          chartType: 'BAR',
          fileType: 'PDF',
          createdBy: 'system',
        },
        {
          title: 'Outstanding AR Customer Invoices',
          module: 'FINANCE',
          description: 'Outstanding Accounts Receivable terms tracking details.',
          filters: JSON.stringify({ status: 'OVERDUE' }),
          chartType: 'PIE',
          fileType: 'EXCEL',
          createdBy: 'system',
        },
        {
          title: 'SCM Reorders & Low Stock Alerts',
          module: 'SCM',
          description: 'Catalog listing products currently below safety stock levels.',
          filters: JSON.stringify({ status: 'LOW_STOCK' }),
          chartType: 'BAR',
          fileType: 'CSV',
          createdBy: 'system',
        },
      ];

      for (const t of systemTemplates) {
        await prisma.reportTemplate.create({ data: t });
      }
    }

    const options: any = {
      where: { tenantId, isSaved: true, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    };
    const templateOptions: any = {
      where: { OR: [{ tenantId: null }, { tenantId }] },
      orderBy: { createdAt: 'desc' },
    };

    if (page || limit) {
      const p = page || 1;
      const l = limit || 20;
      options.skip = (p - 1) * l;
      options.take = l;
      templateOptions.skip = (p - 1) * l;
      templateOptions.take = l;
    } else {
      options.take = 100;
      templateOptions.take = 100;
    }

    const saved = await prisma.report.findMany(options);
    const templates = await prisma.reportTemplate.findMany(templateOptions);

    return { saved, templates };
  }

  async saveCustomReport(
    tenantId: string,
    userId: string,
    data: { title: string; module: string; filters: string; chartType?: string; fileType?: string; description?: string }
  ) {
    return prisma.report.create({
      data: {
        tenantId,
        title: data.title,
        module: data.module,
        description: data.description || null,
        filters: data.filters,
        chartType: data.chartType || 'NONE',
        fileType: data.fileType || 'PDF',
        isSaved: true,
        createdBy: userId,
      },
    });
  }

  async toggleFavoriteReport(tenantId: string, id: string) {
    const report = await prisma.report.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!report) throw new NotFoundError('Saved report template not found');

    return prisma.report.update({
      where: { id },
      data: { isFavorite: !report.isFavorite },
    });
  }

  async deleteSavedReport(tenantId: string, id: string) {
    const report = await prisma.report.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!report) throw new NotFoundError('Saved report template not found');

    return prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ----------------------------------------------------
  // 4. Scheduled Email Reports Runner Configuration
  // ----------------------------------------------------
  async getScheduledReports(tenantId: string) {
    return prisma.scheduledReport.findMany({
      where: { tenantId, deletedAt: null },
      include: { report: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createScheduledReport(
    tenantId: string,
    userId: string,
    data: { reportId: string; schedule: string; recipients: string; format: string }
  ) {
    const report = await prisma.report.findFirst({
      where: { id: data.reportId, tenantId, deletedAt: null },
    });

    if (!report) throw new NotFoundError('Source report layout not found');

    return prisma.scheduledReport.create({
      data: {
        tenantId,
        reportId: data.reportId,
        schedule: data.schedule,
        recipients: data.recipients,
        format: data.format,
        createdBy: userId,
      },
    });
  }

  async toggleScheduledStatus(tenantId: string, id: string) {
    const sched = await prisma.scheduledReport.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!sched) throw new NotFoundError('Scheduled report mapping not found');

    const nextStatus = sched.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return prisma.scheduledReport.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  async deleteScheduledReport(tenantId: string, id: string) {
    const sched = await prisma.scheduledReport.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!sched) throw new NotFoundError('Scheduled report mapping not found');

    return prisma.scheduledReport.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new ReportService();
export const reportService = new ReportService();
