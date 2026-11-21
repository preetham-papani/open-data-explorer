import { Router } from 'express';
import { WeatherController } from '../controllers/weatherController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search', optionalAuth as any, WeatherController.searchCity);
router.get('/forecast', optionalAuth as any, WeatherController.getForecast);

export default router;
