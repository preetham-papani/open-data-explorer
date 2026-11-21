import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { configureSession } from './config/session.js';
import { seedInitialUsers } from './utils/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust first proxy if in production
if (ENV.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS Configuration
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start Server Bootstrap
const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDatabase();

    // 2. Configure Mongo Session Store
    app.use(configureSession());

    // 3. Mount API Routes
    app.use('/api', apiRouter);

    // 4. Serve Frontend Static Production Assets (Single Deployment Mode)
    // __dirname = backend/dist in production, so go up 3 levels to repo root then into frontend/dist
    // Also try cwd-relative path as fallback (works on Render)
    const cwdDist = path.resolve(process.cwd(), 'frontend/dist');
    const relDist = path.resolve(__dirname, '../../frontend/dist');
    const frontendDist = require('fs').existsSync(cwdDist) ? cwdDist : relDist;
    console.log(`🔍 [Server] Looking for frontend at: ${frontendDist}`);
    if (fs.existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontendDist, 'index.html'));
      });
      console.log(`📦 [Server] Static React frontend mounted from: ${frontendDist}`);
    }

    // 5. Centralized Error Handler
    app.use(errorHandler);

    // 6. Seed Users
    await seedInitialUsers();

    // 7. Listen
    const server = app.listen(ENV.PORT, () => {
      console.log('====================================================');
      console.log(`🌐 OPEN DATA EXPLORER FULL-STACK PRODUCTION SERVER`);
      console.log(`🚀 Live Server: http://localhost:${ENV.PORT}`);
      console.log(`📚 REST API:   http://localhost:${ENV.PORT}/api/health`);
      console.log(`🔑 Admin:      ${ENV.ADMIN_EMAIL} / ${ENV.ADMIN_PASSWORD}`);
      console.log(`👤 Student:    ${ENV.DEMO_USER_EMAIL} / ${ENV.DEMO_USER_PASSWORD}`);
      console.log('====================================================');
    });

    return server;
  } catch (error: any) {
    console.error('❌ [Server] Failed to launch server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
