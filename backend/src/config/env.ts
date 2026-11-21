import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'open_data_explorer_super_secret_session_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CACHE_TTL_MINUTES: parseInt(process.env.CACHE_TTL_MINUTES || '60', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@opendata.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL || 'user@opendata.com',
  DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD || 'User@123',
};
