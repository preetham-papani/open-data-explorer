import { Request, Response, NextFunction } from 'express';
import { CountryService } from '../services/countryService.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Types } from 'mongoose';

export class CountryController {
  /**
   * Get all countries with pagination, search, sorting, and region filter
   */
  public static async getCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const search = (req.query.search as string) || (req.query.q as string) || '';
      const region = (req.query.region as string) || '';
      const sortBy = (req.query.sortBy as any) || 'name';
      const sortOrder = (req.query.sortOrder as any) || 'asc';

      const result = await CountryService.getCountries({
        page,
        limit,
        search,
        region,
        sortBy,
        sortOrder,
      });

      // If user is authenticated and performed a search query, save to SearchHistory
      if (search && req.session?.userId) {
        try {
          await SearchHistory.create({
            userId: new Types.ObjectId(req.session.userId),
            query: search,
            type: 'country',
            metadata: { totalResults: result.total, region: region || 'All' },
          });
        } catch (hErr) {
          // Non-blocking history logging
        }
      }

      sendSuccess(res, 'Countries fetched successfully', result.countries, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        cached: result.cached,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Search countries specifically by query
   */
  public static async searchCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || (req.query.search as string) || '';
      if (!query.trim()) {
        sendError(res, "Search query parameter 'q' is required.", null, 400);
        return;
      }

      const countries = await CountryService.searchCountries(query);

      // Record search history if user logged in
      if (req.session?.userId) {
        try {
          await SearchHistory.create({
            userId: new Types.ObjectId(req.session.userId),
            query,
            type: 'country',
            metadata: { count: countries.length },
          });
        } catch (hErr) {}
      }

      sendSuccess(res, `Found ${countries.length} matching countries`, countries, {
        total: countries.length,
        cached: true,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Country Details by Code (CCA2 or CCA3)
   */
  public static async getCountryByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      if (!code) {
        sendError(res, 'Country code parameter is required.', null, 400);
        return;
      }

      const country = await CountryService.getCountryByCode(code);
      if (!country) {
        sendError(res, `Country not found with code: '${code}'`, null, 404);
        return;
      }

      sendSuccess(res, `Details for ${country.name}`, country, { cached: true });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Filter countries by region
   */
  public static async getCountriesByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { region } = req.params;
      if (!region) {
        sendError(res, 'Region parameter is required.', null, 400);
        return;
      }

      const countries = await CountryService.getCountriesByRegion(region);
      sendSuccess(res, `Countries in ${region}`, countries, {
        total: countries.length,
        cached: true,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Compare two countries side by side
   */
  public static async compareCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const first = (req.query.first as string) || (req.query.c1 as string);
      const second = (req.query.second as string) || (req.query.c2 as string);

      if (!first || !second) {
        sendError(
          res,
          "Both 'first' and 'second' country codes are required (e.g. ?first=IN&second=US).",
          null,
          400
        );
        return;
      }

      const comparison = await CountryService.compareCountries(first, second);
      sendSuccess(
        res,
        `Comparison between ${comparison.country1.name} and ${comparison.country2.name}`,
        comparison
      );
    } catch (err) {
      next(err);
    }
  }
}
