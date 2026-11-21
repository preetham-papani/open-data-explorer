import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

export const connectDatabase = async (): Promise<string> => {
  try {
    let uri = ENV.MONGODB_URI;

    if (!uri) {
      console.log('⚡ [Database] MONGODB_URI not provided. Initializing embedded in-memory MongoDB engine...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'opendata_explorer'
          }
        });
        uri = mongodInstance.getUri();
        console.log(`✅ [Database] In-memory MongoDB instance started at: ${uri}`);
        console.log('💡 [Database] Tip: Add your MongoDB Atlas connection string in .env to persist across restarts.');
      } catch (memErr: any) {
        console.warn('⚠️ [Database] Could not start in-memory Mongo, trying default local URI:', memErr.message);
        uri = 'mongodb://127.0.0.1:27017/opendata_explorer';
      }
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`🚀 [Database] Mongoose connected successfully to: ${mongoose.connection.host || 'cluster'}`);
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
