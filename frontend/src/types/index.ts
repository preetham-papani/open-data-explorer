export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt?: string;
}

export interface Country {
  _id?: string;
  cca2: string;
  cca3: string;
  name: string;
  officialName?: string;
  capital: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  flag: string;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  timezones: string[];
  borders: string[];
  latlng: number[];
  maps: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  cachedAt?: string;
  expiresAt?: string;
}

export interface CountryComparison {
  country1: Country;
  country2: Country;
  metrics: {
    population: {
      higher: string;
      difference: number;
      ratio: string;
    };
    area: {
      larger: string;
      difference: number;
    };
    geographic: {
      sameRegion: boolean;
      shareBorder: boolean;
    };
    economic: {
      currenciesShared: string[];
    };
  };
}

export interface WeatherCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
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

export interface DailyWeather {
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

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  weatherCode: number;
}

export interface WeatherData {
  location: WeatherCity;
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
}

export interface CurrencyRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyConversionResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  result: number;
  date: string;
}

export interface CurrencyHistoryRecord {
  _id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  createdAt: string;
}

export interface SavedItem {
  _id: string;
  userId: string;
  itemType: 'country' | 'weather' | 'currency';
  itemId: string;
  title: string;
  subtitle?: string;
  data: Record<string, any>;
  createdAt: string;
}

export interface SearchHistoryItem {
  _id: string;
  userId: string;
  query: string;
  type: 'country' | 'weather' | 'currency';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    admins: number;
    active: number;
  };
  searches: {
    total: number;
    byType: {
      country: number;
      weather: number;
      currency: number;
    };
  };
  savedItems: {
    total: number;
  };
  conversions: {
    total: number;
  };
  cache: {
    totalRecords: number;
    activeRecords: number;
    lastCachedAt: string | null;
    expiresAt: string | null;
    ttlMinutes: number;
  };
  recentUsers: User[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    cached?: boolean;
    timestamp?: string;
    [key: string]: any;
  };
}
