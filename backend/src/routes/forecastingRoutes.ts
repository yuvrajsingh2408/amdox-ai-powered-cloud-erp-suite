import { Router } from 'express';
import scmController from '../controllers/scmController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/run', scmController.runForecast);

export default router;
export { router };
