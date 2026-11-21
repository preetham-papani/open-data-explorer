import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;
let resolvedUri: string = '';

export const getMongoUri = () => resolvedUri;

export const connectDatabase = async (): Promise<string> => {
  try {
    let uri = ENV.MONGODB_URI;

    if (!uri) {
      console.log('⚡ [Database] MONGODB_URI not provided. Trying embedded in-memory MongoDB...');
      try {
        // Check if we're on a platform that supports mongodb-memory-server
        // Render free tier may not support downloading MongoDB binary
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: { dbName: 'opendata_explorer' }
        });
        uri = mongodInstance.getUri();
        console.log(`✅ [Database] In-memory MongoDB started at: ${uri}`);
      } catch (memErr: any) {
        console.warn('⚠️ [Database] In-memory MongoDB failed:', memErr.message);
        // Fallback: try local mongod
        uri = 'mongodb://127.0.0.1:27017/opendata_explorer';
        console.log('↩️  [Database] Falling back to local MongoDB at', uri);
      }
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    resolvedUri = uri;
    console.log(`🚀 [Database] Mongoose connected to: ${mongoose.connection.host || 'cluster'}`);
    return uri;
  } catch (error: any) {
    console.error('❌ [Database] Connection error:', error.message);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('🔌 [Database] Disconnected from MongoDB');
  } catch (error: any) {
    console.error('❌ [Database] Error during disconnect:', error.message);
  }
};
