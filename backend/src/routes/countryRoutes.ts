import { Router } from 'express';
import { CountryController } from '../controllers/countryController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Notice order: /search, /compare, /region/:region before /:code so 'search' isn't captured as :code
router.get('/', optionalAuth as any, CountryController.getCountries);
router.get('/search', optionalAuth as any, CountryController.searchCountries);
router.get('/compare', optionalAuth as any, CountryController.compareCountries);
router.get('/region/:region', optionalAuth as any, CountryController.getCountriesByRegion);
router.get('/:code', optionalAuth as any, CountryController.getCountryByCode);

export default router;
