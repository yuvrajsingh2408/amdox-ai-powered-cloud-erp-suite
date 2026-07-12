import { Router } from 'express';
import crmController from '../controllers/crmController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Dashboard
router.get('/dashboard', crmController.getDashboard);

// Leads mappings
router.route('/leads')
  .get(crmController.getLeads)
  .post(crmController.createLead);

router.get('/leads/:id/predict', crmController.predictLeadConversion);

// Clients mappings
router.route('/clients')
  .get(crmController.getClients)
  .post(crmController.createClient);

// Deals mappings
router.route('/deals')
  .get(crmController.getDeals)
  .post(crmController.createDeal);

// Meetings mappings
router.route('/meetings')
  .get(crmController.getMeetings)
  .post(crmController.createMeeting);

export default router;
export { router };
