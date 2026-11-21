import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes.js';
import countryRoutes from './countryRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import currencyRoutes from './currencyRoutes.js';
import savedRoutes from './savedRoutes.js';
import historyRoutes from './historyRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

// Health and API Status
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    project: 'OPEN DATA EXPLORER API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/countries', countryRoutes);
apiRouter.use('/weather', weatherRoutes);
apiRouter.use('/currency', currencyRoutes);
apiRouter.use('/saved', savedRoutes);
apiRouter.use('/history', historyRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
