import { Router } from 'express';
import { SavedItemController } from '../controllers/savedItemController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth as any);

router.post('/', SavedItemController.saveItem as any);
router.get('/', SavedItemController.getSavedItems as any);
router.delete('/:id', SavedItemController.deleteSavedItem as any);

export default router;
