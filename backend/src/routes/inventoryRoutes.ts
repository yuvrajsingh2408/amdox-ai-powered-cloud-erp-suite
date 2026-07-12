import { Router } from 'express';
import scmController from '../controllers/scmController';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.route('/products')
  .get(scmController.getProducts)
  .post(restrictTo('ADMIN', 'SCM_MANAGER'), scmController.createProduct);

router.post('/adjust', restrictTo('ADMIN', 'SCM_MANAGER'), scmController.adjustStock);
router.get('/movements', scmController.getStockMovements);

export default router;
export { router };
