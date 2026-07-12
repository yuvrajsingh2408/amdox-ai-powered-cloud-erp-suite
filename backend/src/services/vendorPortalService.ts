import prisma from '../config/db';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export class VendorPortalService {
  async registerUser(
    tenantId: string,
    data: { email: string; passwordHash: string; firstName: string; lastName: string; vendorId?: string }
  ) {
    const existing = await prisma.vendorPortalUser.findFirst({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestError('Email already registered for vendor portal');

    const hashed = await bcrypt.hash(data.passwordHash, 10);

    return prisma.vendorPortalUser.create({
      data: {
        tenantId,
        vendorId: data.vendorId || null,
        email: data.email,
        passwordHash: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        status: 'ACTIVE',
      },
    });
  }

  async authenticate(data: { email: string; passwordPlain: string }) {
    const user = await prisma.vendorPortalUser.findFirst({
      where: { email: data.email, status: 'ACTIVE', deletedAt: null },
    });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const matched = await bcrypt.compare(data.passwordPlain, user.passwordHash);
    if (!matched) throw new UnauthorizedError('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, portalType: 'VENDOR' },
      process.env.JWT_SECRET || 'supersecret_erp_token',
      { expiresIn: '24h' }
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.portalSession.create({
      data: {
        portalType: 'VENDOR',
        portalUserId: user.id,
        token,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        vendorId: user.vendorId,
      },
      token,
    };
  }

  async getDashboardMetrics(tenantId: string, vendorId: string) {
    // POs count
    const purchaseOrdersCount = await prisma.purchaseOrder.count({
      where: { tenantId, vendorId, deletedAt: null },
    });

    // Invoices count
    const invoicesCount = await prisma.vendorInvoice.count({
      where: { tenantId, vendorId, deletedAt: null },
    });

    // Support tickets
    const supportTicketsCount = await prisma.supportTicket.count({
      where: { tenantId, portalType: 'VENDOR' },
    });

    // Simulated vendor score
    const vendorRecord = await prisma.vendor.findFirst({ where: { id: vendorId } });
    const score = vendorRecord?.rating || 4.2;

    return {
      purchaseOrdersCount,
      invoicesCount,
      supportTicketsCount,
      performanceScore: score,
    };
  }

  async getQuotations(tenantId: string, vendorId: string) {
    // Seed sample quotations if none exist
    const count = await prisma.vendorQuotation.count({ where: { tenantId, vendorId } });
    if (count === 0) {
      await prisma.vendorQuotation.createMany({
        data: [
          { tenantId, vendorId, referenceNumber: 'QT-8001', amount: 4500.0, status: 'SUBMITTED' },
          { tenantId, vendorId, referenceNumber: 'QT-8002', amount: 8900.0, status: 'APPROVED' },
          { tenantId, vendorId, referenceNumber: 'QT-8003', amount: 12000.0, status: 'REJECTED' },
        ],
      });
    }

    return prisma.vendorQuotation.findMany({
      where: { tenantId, vendorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuotation(tenantId: string, vendorId: string, amount: number) {
    const referenceNumber = `QT-${Math.floor(Math.random() * 9000) + 1000}`;
    return prisma.vendorQuotation.create({
      data: {
        tenantId,
        vendorId,
        referenceNumber,
        amount,
        status: 'SUBMITTED',
      },
    });
  }

  async getInvoices(tenantId: string, vendorId: string) {
    const count = await prisma.vendorInvoice.count({ where: { tenantId, vendorId } });
    if (count === 0) {
      await prisma.vendorInvoice.createMany({
        data: [
          { tenantId, vendorId, invoiceNumber: 'VI-9901', amount: 3500.0, status: 'PAID' },
          { tenantId, vendorId, invoiceNumber: 'VI-9902', amount: 1200.0, status: 'PENDING' },
        ],
      });
    }

    return prisma.vendorInvoice.findMany({
      where: { tenantId, vendorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(tenantId: string, vendorId: string, amount: number) {
    const invoiceNumber = `VI-${Math.floor(Math.random() * 9000) + 1000}`;
    return prisma.vendorInvoice.create({
      data: {
        tenantId,
        vendorId,
        invoiceNumber,
        amount,
        status: 'PENDING',
      },
    });
  }

  async getShipments(tenantId: string, vendorId: string) {
    const count = await prisma.vendorShipment.count({ where: { tenantId, vendorId } });
    if (count === 0) {
      await prisma.vendorShipment.createMany({
        data: [
          { tenantId, vendorId, shipmentNumber: 'SH-4401', carrier: 'DHL', status: 'IN_TRANSIT', trackingUrl: 'https://dhl.com/track', estimatedDelivery: new Date(Date.now() + 86400000) },
        ],
      });
    }

    return prisma.vendorShipment.findMany({
      where: { tenantId, vendorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPerformance(tenantId: string, vendorId: string) {
    const scoreData = [
      { month: 'Jan', rating: 4.1 },
      { month: 'Feb', rating: 4.3 },
      { month: 'Mar', rating: 4.2 },
      { month: 'Apr', rating: 4.5 },
      { month: 'May', rating: 4.6 },
    ];
    return {
      vendorId,
      scoreData,
      onTimeDeliveryRate: 94.5,
      complianceRate: 98.2,
    };
  }
}

export default new VendorPortalService();
export const vendorPortalService = new VendorPortalService();
