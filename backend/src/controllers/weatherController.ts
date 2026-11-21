import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weatherService.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Types } from 'mongoose';

export class WeatherController {
  /**
   * Search city locations and immediate weather overview
   */
  public static async searchCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = (req.query.city as string) || (req.query.q as string) || '';
      if (!city.trim()) {
        sendError(res, "City search query parameter 'city' is required.", null, 400);
        return;
      }

      const locations = await WeatherService.searchCity(city);
      if (locations.length === 0) {
        sendError(res, `No geographic locations found matching '${city}'.`, null, 404);
        return;
      }

      // Record in SearchHistory if user logged in
      if (req.session?.userId) {
        try {
          await SearchHistory.create({
            userId: new Types.ObjectId(req.session.userId),
            query: city,
            type: 'weather',
            metadata: { location: locations[0].name, country: locations[0].country },
          });
        } catch (hErr) {}
      }

      sendSuccess(res, `Found ${locations.length} matching locations`, locations);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get 7-day weather forecast for a specified city
   */
  public static async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const city = (req.query.city as string) || (req.query.q as string) || '';
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

      let forecastData;
      if (lat !== undefined && lon !== undefined) {
        forecastData = await WeatherService.getForecastByCoords(lat, lon, {
          name: city || 'Custom Location',
        });
      } else if (city.trim()) {
        forecastData = await WeatherService.getForecastByCity(city);
      } else {
        sendError(res, "Either 'city' or 'lat' and 'lon' parameters are required.", null, 400);
        return;
      }

      // Record search history if user logged in
      if (req.session?.userId && city) {
        try {
          await SearchHistory.create({
            userId: new Types.ObjectId(req.session.userId),
            query: city,
            type: 'weather',
            metadata: {
              location: forecastData.location.name,
              temp: forecastData.current.temperature,
              condition: forecastData.current.condition,
            },
          });
        } catch (hErr) {}
      }

      sendSuccess(
        res,
        `Weather forecast for ${forecastData.location.name}, ${forecastData.location.country}`,
        forecastData
      );
    } catch (err) {
      next(err);
    }
  }
}
