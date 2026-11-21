import { Router } from 'express';
import { CurrencyController } from '../controllers/currencyController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/currencies', CurrencyController.getCurrencies);
router.get('/rates', CurrencyController.getRates);
router.get('/convert', optionalAuth as any, CurrencyController.convertCurrency);
router.get('/history', requireAuth as any, CurrencyController.getUserConversionHistory as any);

export default router;
