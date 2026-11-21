import axios from 'axios';
import { getWeatherDescription } from '../utils/weatherIcons.js';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface CityLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string; // State / Region
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  isDay: boolean;
  weatherCode: number;
  condition: string;
  description: string;
  icon: string;
  time: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  description: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  weatherCode: number;
}

export class WeatherService {
  /**
   * Search city location via Open-Meteo Geocoding API
   */
  public static async searchCity(cityName: string): Promise<CityLocation[]> {
    const trimmed = cityName.trim();
    if (!trimmed) {
      throw new Error('City name parameter is required');
    }

    const response = await axios.get(GEOCODING_BASE_URL, {
      params: {
        name: trimmed,
        count: 5,
        language: 'en',
        format: 'json',
      },
      timeout: 10000,
    });

    if (!response.data.results || response.data.results.length === 0) {
      return [];
    }

    return response.data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country || '',
      country_code: r.country_code || '',
      admin1: r.admin1 || '',
      timezone: r.timezone || 'auto',
    }));
  }

  /**
   * Retrieve weather forecast for a city by name
   */
  public static async getForecastByCity(cityName: string) {
    const locations = await this.searchCity(cityName);
    if (locations.length === 0) {
      throw new Error(`Location not found for city: '${cityName}'. Please check the spelling.`);
    }

    const location = locations[0];
    return this.getForecastByCoords(location.latitude, location.longitude, location);
  }

  /**
   * Retrieve weather forecast by coordinates
   */
  public static async getForecastByCoords(lat: number, lon: number, locationMeta?: Partial<CityLocation>) {
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'weather_code',
          'wind_speed_10m',
          'wind_direction_10m',
          'surface_pressure',
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'wind_speed_10m_max',
        ].join(','),
        hourly: ['temperature_2m', 'relative_humidity_2m', 'weather_code'].join(','),
        timezone: locationMeta?.timezone || 'auto',
        forecast_days: 7,
      },
      timeout: 10000,
    });

    const data = response.data;
    const currentRaw = data.current || {};
    const codeInfo = getWeatherDescription(currentRaw.weather_code || 0);

    const currentWeather: CurrentWeather = {
      temperature: currentRaw.temperature_2m,
      apparentTemperature: currentRaw.apparent_temperature ?? currentRaw.temperature_2m,
      humidity: currentRaw.relative_humidity_2m,
      windSpeed: currentRaw.wind_speed_10m,
      windDirection: currentRaw.wind_direction_10m || 0,
      pressure: currentRaw.surface_pressure || 1013,
      isDay: currentRaw.is_day === 1,
      weatherCode: currentRaw.weather_code || 0,
      condition: codeInfo.condition,
      description: codeInfo.description,
      icon: codeInfo.icon,
      time: currentRaw.time,
    };

    // Daily Forecast
    const dailyRaw = data.daily || { time: [] };
    const days: DailyForecast[] = (dailyRaw.time || []).map((dateStr: string, idx: number) => {
      const code = dailyRaw.weather_code?.[idx] || 0;
      const dInfo = getWeatherDescription(code);
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      return {
        date: dateStr,
        dayName,
        weatherCode: code,
        condition: dInfo.condition,
        description: dInfo.description,
        icon: dInfo.icon,
        tempMax: dailyRaw.temperature_2m_max?.[idx],
        tempMin: dailyRaw.temperature_2m_min?.[idx],
        precipitationSum: dailyRaw.precipitation_sum?.[idx] || 0,
        windSpeedMax: dailyRaw.wind_speed_10m_max?.[idx] || 0,
      };
    });

    // Hourly Forecast (next 24 hours)
    const hourlyRaw = data.hourly || { time: [] };
    const hourly: HourlyForecast[] = [];
    const maxHours = Math.min(24, (hourlyRaw.time || []).length);
    for (let i = 0; i < maxHours; i++) {
      hourly.push({
        time: hourlyRaw.time[i],
        temperature: hourlyRaw.temperature_2m?.[i],
        humidity: hourlyRaw.relative_humidity_2m?.[i],
        weatherCode: hourlyRaw.weather_code?.[i] || 0,
      });
    }

    return {
      location: {
        name: locationMeta?.name || 'Selected Location',
        country: locationMeta?.country || '',
        country_code: locationMeta?.country_code || '',
        admin1: locationMeta?.admin1 || '',
        latitude: lat,
        longitude: lon,
        timezone: data.timezone || 'auto',
      },
      current: currentWeather,
      daily: days,
      hourly,
    };
  }
}
