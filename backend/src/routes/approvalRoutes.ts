import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import approvalController from '../controllers/approvalController';

const router = Router();

// Apply auth locks
router.use(protect);

router.get('/inbox', approvalController.getInboxApprovals);
router.get('/history', approvalController.getHistory);
router.post('/escalate-overdue', approvalController.triggerEscalations);

router.post('/:id/decision', approvalController.submitDecision);
router.get('/:id/ai-recommendation', approvalController.getAIRecommendation);

export default router;
