import { Router } from 'express';
import scmController from '../controllers/scmController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Vendors
router.route('/vendors')
  .get(scmController.getVendors)
  .post(restrictTo('ADMIN', 'SCM_MANAGER'), scmController.createVendor);

// Purchase Requisitions
router.route('/requisitions')
  .get(scmController.getRequisitions)
  .post(scmController.createRequisition);
router.post('/requisitions/:id/approve', scmController.approveRequisition);

// Purchase Orders
router.route('/pos')
  .get(scmController.getPurchaseOrders)
  .post(restrictTo('ADMIN', 'SCM_MANAGER'), scmController.createPurchaseOrder);
router.post('/pos/:id/cancel', restrictTo('ADMIN', 'SCM_MANAGER'), scmController.cancelPurchaseOrder);

// Goods Receipt Note (GRN)
router.route('/grns')
  .get(scmController.getGRNs)
  .post(restrictTo('ADMIN', 'SCM_MANAGER'), scmController.createGRN);

// Warehouses
router.route('/warehouses')
  .get(scmController.getWarehouses)
  .post(restrictTo('ADMIN', 'SCM_MANAGER'), scmController.createWarehouse);

// AI suggestions & forecasting
router.get('/reorders/suggestions', scmController.getReorderSuggestions);
router.post('/forecasting/run', scmController.runForecast);

export default router;
export { router };
