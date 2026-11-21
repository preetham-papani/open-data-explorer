import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin as any);

router.get('/stats', AdminController.getDashboardStats as any);
router.get('/users', AdminController.getAllUsers as any);
router.put('/users/:id', AdminController.updateUser as any);
router.delete('/users/:id', AdminController.deleteUser as any);
router.post('/cache/refresh', AdminController.refreshCountryCache as any);
router.post('/cache/clear', AdminController.clearCountryCache as any);

export default router;
