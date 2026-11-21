import { Router } from 'express';
import { HistoryController } from '../controllers/historyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', HistoryController.getSearchHistory as any);
router.delete('/:id', HistoryController.deleteHistoryItem as any);
router.delete('/', HistoryController.clearAllHistory as any);

export default router;
