import { Request, Response, NextFunction } from 'express';
import { CurrencyService } from '../services/currencyService.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Types } from 'mongoose';

export class CurrencyController {
  /**
   * Get supported currencies list
   */
  public static async getCurrencies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currencies = await CurrencyService.getCurrencies();
      sendSuccess(res, 'Supported currencies retrieved', currencies);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get latest exchange rates for a base currency
   */
  public static async getRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const base = (req.query.base as string) || 'USD';
      const rates = await CurrencyService.getRates(base);
      sendSuccess(res, `Latest exchange rates for ${base.toUpperCase()}`, rates);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Convert currency
   */
  public static async convertCurrency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const from = (req.query.from as string) || '';
      const to = (req.query.to as string) || '';
      const amountStr = (req.query.amount as string) || '1';
      const amount = parseFloat(amountStr);

      if (!from || !to) {
        sendError(res, "Query parameters 'from' and 'to' are required (e.g. ?from=USD&to=EUR).", null, 400);
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        sendError(res, "Parameter 'amount' must be a valid positive number.", null, 400);
        return;
      }

      const userId = req.session?.userId;
      const result = await CurrencyService.convertCurrency(from, to, amount, userId);

      // Record in SearchHistory if user logged in
      if (userId) {
        try {
          await SearchHistory.create({
            userId: new Types.ObjectId(userId),
            query: `${amount} ${from.toUpperCase()} to ${to.toUpperCase()}`,
            type: 'currency',
            metadata: { from, to, amount, result: result.result, rate: result.rate },
          });
        } catch (hErr) {}
      }

      sendSuccess(res, `${amount} ${from.toUpperCase()} = ${result.result.toFixed(2)} ${to.toUpperCase()}`, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get conversion history for logged in user
   */
  public static async getUserConversionHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.session?.userId) {
        sendError(res, 'Authentication required to access conversion history.', null, 401);
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const history = await CurrencyService.getUserConversionHistory(req.session.userId, limit);

      sendSuccess(res, 'Currency conversion history retrieved', history);
    } catch (err) {
      next(err);
    }
  }
}
