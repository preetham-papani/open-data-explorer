import session from 'express-session';
import MongoStore from 'connect-mongo';
import { ENV } from './env.js';
import { getMongoUri } from './database.js';

export const configureSession = () => {
  const mongoUrl = getMongoUri();

  const store = mongoUrl
    ? MongoStore.create({
        mongoUrl,
        dbName: 'opendata_explorer',
        collectionName: 'sessions',
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
      })
    : undefined; // fallback: memory store (for edge cases)

  return session({
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
};
