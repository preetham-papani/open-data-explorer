import axios from 'axios';
import { CurrencyHistory } from '../models/CurrencyHistory.js';
import { Types } from 'mongoose';

const FRANKFURTER_BASE_URL = 'https://api.frankfurter.app';

export interface CurrencyConversionResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  date: string;
}

export class CurrencyService {
  /**
   * Get supported currencies dictionary
   */
  public static async getCurrencies(): Promise<Record<string, string>> {
    const response = await axios.get<Record<string, string>>(`${FRANKFURTER_BASE_URL}/currencies`, {
      timeout: 10000,
    });
    return response.data;
  }

  /**
   * Get latest exchange rates for a base currency
   */
  public static async getRates(base: string = 'USD') {
    const baseCode = base.trim().toUpperCase();
    const response = await axios.get(`${FRANKFURTER_BASE_URL}/latest`, {
      params: { from: baseCode },
      timeout: 10000,
    });
    return response.data;
  }

  /**
   * Convert currency with validation and history logging for authenticated users
   */
  public static async convertCurrency(
    from: string,
    to: string,
    amount: number,
    userId?: string
  ): Promise<CurrencyConversionResult> {
    const fromCode = from.trim().toUpperCase();
    const toCode = to.trim().toUpperCase();

    if (!fromCode || !toCode) {
      throw new Error("Both 'from' and 'to' currency parameters are required.");
    }

    if (isNaN(amount) || amount <= 0) {
      throw new Error('Conversion amount must be a positive number greater than 0.');
    }

    // Handle identical currencies
    if (fromCode === toCode) {
      return {
        from: fromCode,
        to: toCode,
        amount,
        rate: 1,
        result: amount,
        date: new Date().toISOString().split('T')[0],
      };
    }

    const response = await axios.get(`${FRANKFURTER_BASE_URL}/latest`, {
      params: {
        amount,
        from: fromCode,
        to: toCode,
      },
      timeout: 10000,
    });

    const data = response.data;
    const rate = data.rates?.[toCode];
    if (typeof rate !== 'number') {
      throw new Error(`Exchange rate not found for currency pair: ${fromCode} to ${toCode}`);
    }

    const result: CurrencyConversionResult = {
      from: fromCode,
      to: toCode,
      amount,
      rate: rate / amount,
      result: rate,
      date: data.date,
    };

    // If a logged-in user executed the conversion, save into MongoDB CurrencyHistory
    if (userId) {
      try {
        await CurrencyHistory.create({
          userId: new Types.ObjectId(userId),
          fromCurrency: fromCode,
          toCurrency: toCode,
          amount,
          result: rate,
          rate: rate / amount,
        });
      } catch (logErr: any) {
        console.warn('⚠️ [CurrencyService] Failed to save conversion history:', logErr.message);
      }
    }

    return result;
  }

  /**
   * Retrieve conversion history for a user
   */
  public static async getUserConversionHistory(userId: string, limit: number = 20) {
    return CurrencyHistory.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
