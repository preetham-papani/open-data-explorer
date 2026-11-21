import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { ENV } from './env.js';

export const configureSession = () => {
  return session({
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      clientPromise: mongoose.connection.asPromise().then((m) => m.getClient() as any),
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
};
