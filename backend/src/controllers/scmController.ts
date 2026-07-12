import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import scmService from '../services/scmService';
import prisma from '../config/db';
import { BadRequestError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export class ScmController {
  // --- Vendor Controls ---
  async getVendors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const pageNum = page ? parseInt(page as string) : undefined;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const list = await scmService.getVendors(req.tenantId!, pageNum, limitNum);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Vendors fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, email, phone, address, category, rating } = req.body;
      if (!name || !code || !email) {
        return next(new BadRequestError('Name, code, and email are required properties'));
      }
      
      const vendor = await scmService.createVendor(req.tenantId!, req.body);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Vendor registered successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Purchase Requisition Controls ---
  async getRequisitions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await scmService.getRequisitions(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Purchase requisitions fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  async createRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, reason, vendorId, items } = req.body;
      if (!departmentId || !reason || !items || !Array.isArray(items)) {
        return next(new BadRequestError('DepartmentId, reason, and items array are required'));
      }

      // Fetch employee ID linked to logged in user
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user?.id, tenantId: req.tenantId! }
      });
      if (!employee) {
        return next(new BadRequestError('Logged in user is not registered as an Employee'));
      }

      const pr = await scmService.createRequisition(req.tenantId!, {
        requesterId: employee.id,
        departmentId,
        reason,
        vendorId,
        items
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Purchase requisition logged successfully',
        data: pr
      });
    } catch (error) {
      next(error);
    }
  }

  async approveRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const approved = await scmService.approveRequisition(req.tenantId!, id, req.user!.id, req.user!.role);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Purchase requisition approval level checkoff completed',
        data: approved
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Purchase Order Controls ---
  async getPurchaseOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await scmService.getPurchaseOrders(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Purchase orders fetched successfully',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poNumber, vendorId, orderDate, items } = req.body;
      if (!poNumber || !vendorId || !orderDate || !items || !Array.isArray(items)) {
        return next(new BadRequestError('PO details (poNumber, vendorId, orderDate, items) are required'));
      }

      const po = await scmService.createPurchaseOrder(req.tenantId!, req.body, req.user?.id);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Purchase order created successfully',
        data: po,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPurchaseOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cancelled = await scmService.cancelPurchaseOrder(req.tenantId!, id, req.user!.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Purchase order cancelled successfully',
        data: cancelled
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Goods Receipt (GRN) Controls ---
  async getGRNs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await scmService.getGRNs(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Goods receipt logs fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  async createGRN(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { purchaseOrderId, receivedDate, partialReceive, damagedItems, items } = req.body;
      if (!purchaseOrderId || !receivedDate || !items || !Array.isArray(items)) {
        return next(new BadRequestError('purchaseOrderId, receivedDate, and items array are required'));
      }

      const grn = await scmService.createGRN(req.tenantId!, req.body, req.user!.id);
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'GRN logged and inventory levels updated successfully',
        data: grn
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Inventory & Stock Controls ---
  async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      const list = await prisma.product.findMany({
        where: { 
          tenantId: req.tenantId,
          deletedAt: null
        },
        include: { warehouse: { select: { name: true } } },
        orderBy: { sku: 'asc' },
        skip: page || limit ? ((parseInt(page as string) || 1) - 1) * (parseInt(limit as string) || 50) : undefined,
        take: page || limit ? (parseInt(limit as string) || 50) : 1000
      });

      const formatted = list.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        unitPrice: p.unitPrice,
        quantityInStock: p.quantityInStock,
        reorderLevel: p.reorderLevel,
        reorderQuantity: p.reorderQuantity,
        warehouseName: p.warehouse?.name,
        category: p.category,
        brand: p.brand,
        unit: p.unit,
        hsnCode: p.hsnCode,
        gstRate: p.gstRate
      }));

      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Inventory products fetched successfully',
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, sku, description, unitPrice, reorderLevel, reorderQuantity, warehouseId, category, brand, unit, hsnCode, gstRate } = req.body;
      if (!name || !sku || !unitPrice) {
        return next(new BadRequestError('Name, SKU, and unitPrice are required'));
      }

      const dup = await prisma.product.findFirst({
        where: { sku, tenantId: req.tenantId!, deletedAt: null }
      });
      if (dup) {
        return next(new BadRequestError('Product SKU code already exists'));
      }

      const product = await prisma.product.create({
        data: {
          name,
          sku,
          description,
          unitPrice: parseFloat(unitPrice),
          reorderLevel: parseInt(reorderLevel || 10),
          reorderQuantity: parseInt(reorderQuantity || 50),
          warehouseId: warehouseId || null,
          category,
          brand,
          unit,
          hsnCode,
          gstRate: parseFloat(gstRate || 18.0),
          tenantId: req.tenantId!
        }
      });

      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Product registered successfully in item master',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await scmService.getStockMovements(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Stock movements fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, type } = req.body;
      if (!productId || !quantity || !type) {
        return next(new BadRequestError('Properties (productId, quantity, type) are required'));
      }

      const updated = await scmService.adjustStock(req.tenantId!, req.body, req.user?.id);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Stock adjusted successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Warehouse & Bins Controls ---
  async getWarehouses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await scmService.getWarehouses(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'Warehouses logs fetched successfully',
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  async createWarehouse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, location, code } = req.body;
      if (!name || !code) {
        return next(new BadRequestError('Warehouse name and code are required'));
      }

      const wh = await scmService.createWarehouse(req.tenantId!, { name, location, code });
      return sendResponse({
        res,
        statusCode: 201,
        success: true,
        message: 'Warehouse registry created successfully',
        data: wh
      });
    } catch (error) {
      next(error);
    }
  }

  // --- AI Suggestion & Forecast Controls ---
  async getReorderSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const suggestions = await scmService.getReorderSuggestions(req.tenantId!);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI automatic reorder purchase recommendations generated',
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  }

  async runForecast(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sku, periods } = req.body;
      if (!sku) {
        return next(new BadRequestError('Product SKU is required for forecasting'));
      }
      const days = periods ? parseInt(periods) : 7;
      
      const forecastPoints = await scmService.runAIForcasting(req.tenantId!, sku, days);
      return sendResponse({
        res,
        statusCode: 200,
        success: true,
        message: 'AI stock forecasting compiled successfully',
        data: forecastPoints,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ScmController();
export const scmController = new ScmController();
