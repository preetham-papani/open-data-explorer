import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AdminController {
  /**
   * Get complete administrative overview metrics
   */
  public static async getDashboardStats(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();
      sendSuccess(res, 'System statistics retrieved', stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all registered users
   */
  public static async getAllUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;

      const result = await AdminService.getUsers(page, limit, search);
      sendSuccess(res, 'Users retrieved successfully', result.users, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user account status or role
   */
  public static async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;

      const updated = await AdminService.updateUser(id, { role, isActive });
      sendSuccess(res, 'User updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete user account and associated personal data
   */
  public static async deleteUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await AdminService.deleteUser(id);
      sendSuccess(res, 'User and associated data permanently deleted.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Trigger Country Cache Refresh from external API
   */
  public static async refreshCountryCache(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await AdminService.refreshCountryCache();
      sendSuccess(res, `Country cache successfully refreshed with ${count} records.`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Clear Country Cache from MongoDB
   */
  public static async clearCountryCache(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await AdminService.clearCountryCache();
      sendSuccess(res, `Cleared ${count} cached country records from database.`);
    } catch (err) {
      next(err);
    }
  }
}
