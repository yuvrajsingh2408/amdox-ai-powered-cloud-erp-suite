import { Router } from 'express';
import portalController from '../controllers/portalController';

const router = Router();

// Auth routes (Open)
router.post('/customer/register', portalController.registerCustomer);
router.post('/customer/login', portalController.loginCustomer);
router.post('/vendor/register', portalController.registerVendor);
router.post('/vendor/login', portalController.loginVendor);

// Customer portal data (Using query filters for simplified credentials passing)
router.get('/customer/dashboard', portalController.getCustomerDashboard);
router.get('/customer/orders', portalController.getCustomerOrders);
router.get('/customer/payments', portalController.getCustomerPayments);
router.get('/customer/spending', portalController.getCustomerSpending);

// Vendor portal data
router.get('/vendor/dashboard', portalController.getVendorDashboard);
router.get('/vendor/quotations', portalController.getVendorQuotations);
router.post('/vendor/quotations', portalController.createVendorQuotation);
router.get('/vendor/invoices', portalController.getVendorInvoices);
router.post('/vendor/invoices', portalController.createVendorInvoice);
router.get('/vendor/shipments', portalController.getVendorShipments);
router.get('/vendor/performance', portalController.getVendorPerformance);

// Support ticketing (Common routes)
router.route('/tickets')
  .get(portalController.getTickets)
  .post(portalController.createTicket);

router.get('/tickets/:id', portalController.getTicket);
router.post('/tickets/:id/reply', portalController.submitReply);
router.post('/tickets/:id/close', portalController.closeTicket);
router.get('/tickets/:id/ai-suggested-reply', portalController.getAISuggestedReply);

// Knowledge Base & General boards
router.get('/kb', portalController.getKnowledgeArticles);
router.get('/kb/:id', portalController.getKnowledgeArticle);
router.get('/announcements', portalController.getAnnouncements);

export default router;
