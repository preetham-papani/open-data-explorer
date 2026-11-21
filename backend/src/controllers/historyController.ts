import { Response, NextFunction } from 'express';
import { SearchHistory } from '../models/SearchHistory.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Types } from 'mongoose';

export class HistoryController {
  /**
   * Retrieve search history for the authenticated user
   */
  public static async getSearchHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required.', null, 401);
        return;
      }

      const type = req.query.type as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };
      if (type && ['country', 'weather', 'currency'].includes(type)) {
        filter.type = type;
      }

      const history = await SearchHistory.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      sendSuccess(res, 'Search history retrieved', history, { total: history.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a specific search history entry
   */
  public static async deleteHistoryItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required.', null, 401);
        return;
      }

      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        sendError(res, 'Invalid history record ID format.', null, 400);
        return;
      }

      const deleted = await SearchHistory.findOneAndDelete({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });

      if (!deleted) {
        sendError(res, 'History record not found.', null, 404);
        return;
      }

      sendSuccess(res, 'History entry removed successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Clear all search history for the current user
   */
  public static async clearAllHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required.', null, 401);
        return;
      }

      const result = await SearchHistory.deleteMany({ userId: new Types.ObjectId(userId) });
      sendSuccess(res, `Cleared ${result.deletedCount || 0} search history records.`);
    } catch (err) {
      next(err);
    }
  }
}
