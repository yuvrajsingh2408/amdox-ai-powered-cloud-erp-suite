import { Router } from 'express';
import projectController from '../controllers/projectController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(projectController.getProjects)
  .post(restrictTo('ADMIN', 'PROJECT_MANAGER'), projectController.createProject);

router.get('/:id', projectController.getProjectDetails);

// Sprints and milestones
router.post('/sprints', restrictTo('ADMIN', 'PROJECT_MANAGER'), projectController.createSprint);
router.post('/milestones', restrictTo('ADMIN', 'PROJECT_MANAGER'), projectController.createMilestone);

// Task mappings
router.route('/tasks')
  .post(projectController.createTask);

router.get('/tasks/:id', projectController.getTaskDetails);
router.put('/tasks/:id/status', projectController.updateTaskStatus);
router.post('/tasks/:id/comments', projectController.addTaskComment);

export default router;
export { router };
