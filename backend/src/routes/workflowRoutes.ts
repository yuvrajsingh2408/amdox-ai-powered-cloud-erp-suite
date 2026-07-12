import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import workflowController from '../controllers/workflowController';

const router = Router();

// Apply auth locks
router.use(protect);

router.route('/')
  .get(workflowController.getWorkflows)
  .post(workflowController.createWorkflow);

router.get('/templates', workflowController.getTemplates);
router.get('/instances', workflowController.getInstances);

router.route('/:id')
  .put(workflowController.updateWorkflow)
  .delete(workflowController.deleteWorkflow);

router.patch('/:id/toggle', workflowController.toggleActive);
router.post('/:id/duplicate', workflowController.cloneWorkflow);

export default router;
