import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

// Extend Express SessionData interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    email?: string;
    userRole?: 'user' | 'admin';
  }
}

// Extend Request interface to hold authenticated user details
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
  };
}

/**
 * Middleware to require authenticated user session
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId) {
    sendError(res, 'Authentication required. Please log in to access this feature.', null, 401);
    return;
  }

  req.user = {
    id: req.session.userId,
    username: req.session.username || '',
    email: req.session.email || '',
    role: req.session.userRole || 'user',
  };

  next();
};

/**
 * Middleware to require admin authorization
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId) {
    sendError(res, 'Authentication required. Please log in.', null, 401);
    return;
  }

  if (req.session.userRole !== 'admin') {
    sendError(res, 'Access denied. Administrator privileges required.', null, 403);
    return;
  }

  req.user = {
    id: req.session.userId,
    username: req.session.username || '',
    email: req.session.email || '',
    role: 'admin',
  };

  next();
};

/**
 * Middleware to optionally attach user info if logged in
 */
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      username: req.session.username || '',
      email: req.session.email || '',
      role: req.session.userRole || 'user',
    };
  }
  next();
};
