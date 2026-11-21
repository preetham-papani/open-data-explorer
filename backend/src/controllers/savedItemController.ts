import { Response, NextFunction } from 'express';
import { SavedItem } from '../models/SavedItem.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Types } from 'mongoose';

export class SavedItemController {
  /**
   * Save / Bookmark an item (Country, Weather city, Currency pair)
   */
  public static async saveItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required to save items.', null, 401);
        return;
      }

      const { itemType, itemId, title, subtitle, data } = req.body;

      if (!itemType || !itemId || !title) {
        sendError(res, 'itemType, itemId, and title are required fields.', null, 400);
        return;
      }

      const saved = await SavedItem.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          itemType,
          itemId,
        },
        {
          $set: {
            title,
            subtitle: subtitle || '',
            data: data || {},
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      sendSuccess(res, `'${title}' saved to your favourites.`, saved, undefined, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieve all saved items for the logged in user
   */
  public static async getSavedItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required.', null, 401);
        return;
      }

      const type = req.query.type as string;
      const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };
      if (type && ['country', 'weather', 'currency'].includes(type)) {
        filter.itemType = type;
      }

      const items = await SavedItem.find(filter).sort({ createdAt: -1 }).lean();
      sendSuccess(res, 'Saved items retrieved', items, { total: items.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Remove a saved item by its ID
   */
  public static async deleteSavedItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        sendError(res, 'Authentication required.', null, 401);
        return;
      }

      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        sendError(res, 'Invalid saved item ID format.', null, 400);
        return;
      }

      const result = await SavedItem.findOneAndDelete({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });

      if (!result) {
        sendError(res, 'Saved item not found or you do not have permission to delete it.', null, 404);
        return;
      }

      sendSuccess(res, 'Item removed from your favourites.');
    } catch (err) {
      next(err);
    }
  }
}
