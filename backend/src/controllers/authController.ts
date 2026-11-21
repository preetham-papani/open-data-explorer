import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  /**
   * User Registration
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        sendError(res, 'All fields (username, email, password) are required.', null, 400);
        return;
      }

      if (password.length < 6) {
        sendError(res, 'Password must be at least 6 characters long.', null, 400);
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase().trim()) {
          sendError(res, 'An account with this email address already exists.', null, 409);
        } else {
          sendError(res, 'This username is already taken. Please choose another.', null, 409);
        }
        return;
      }

      // Create new user (default role: 'user')
      const newUser = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'user',
        isActive: true,
      });

      await newUser.save();

      // Establish session
      req.session.userId = newUser._id.toString();
      req.session.username = newUser.username;
      req.session.email = newUser.email;
      req.session.userRole = newUser.role;

      sendSuccess(
        res,
        'Registration successful! Welcome to Open Data Explorer.',
        {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        undefined,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * User Login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, 'Email and password are required.', null, 400);
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        sendError(res, 'Invalid email or password.', null, 401);
        return;
      }

      if (!user.isActive) {
        sendError(res, 'Your account has been deactivated. Please contact an administrator.', null, 403);
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        sendError(res, 'Invalid email or password.', null, 401);
        return;
      }

      // Populate session
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.userRole = user.role;

      sendSuccess(res, 'Login successful!', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * User Logout
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid');
        sendSuccess(res, 'You have been logged out successfully.');
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Current Authenticated Profile
   */
  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session.userId) {
        sendError(res, 'Not authenticated', null, 401);
        return;
      }

      const user = await User.findById(req.session.userId).select('-password');
      if (!user) {
        sendError(res, 'User record not found.', null, 404);
        return;
      }

      sendSuccess(res, 'User profile retrieved successfully', {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (err) {
      next(err);
    }
  }
}
