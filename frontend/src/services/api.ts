import axios from 'axios';
import {
  ApiResponse,
  User,
  Country,
  CountryComparison,
  WeatherData,
  WeatherCity,
  CurrencyRatesResponse,
  CurrencyConversionResult,
  CurrencyHistoryRecord,
  SavedItem,
  SearchHistoryItem,
  AdminStats,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response helper
export const handleResponse = async <T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  try {
    const res = await promise;
    return res.data.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'An error occurred while communicating with the service.';
    throw new Error(message);
  }
};

/* Auth API */
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    handleResponse<User>(api.post('/auth/register', data)),
  login: (data: { email: string; password: string }) =>
    handleResponse<User>(api.post('/auth/login', data)),
  logout: () => handleResponse<{ message: string }>(api.post('/auth/logout')),
  getProfile: () => handleResponse<User>(api.get('/auth/profile')),
};

/* Countries API */
export const countryApi = {
  getCountries: (params: {
    page?: number;
    limit?: number;
    search?: string;
    region?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) =>
    api.get<ApiResponse<Country[]>>('/countries', { params }).then((res) => ({
      countries: res.data.data,
      meta: res.data.meta,
    })),
  search: (q: string) => handleResponse<Country[]>(api.get('/countries/search', { params: { q } })),
  getByCode: (code: string) => handleResponse<Country>(api.get(`/countries/${code}`)),
  getByRegion: (region: string) => handleResponse<Country[]>(api.get(`/countries/region/${region}`)),
  compare: (first: string, second: string) =>
    handleResponse<CountryComparison>(api.get('/countries/compare', { params: { first, second } })),
};

/* Weather API */
export const weatherApi = {
  searchCity: (city: string) => handleResponse<WeatherCity[]>(api.get('/weather/search', { params: { city } })),
  getForecast: (city?: string, lat?: number, lon?: number) =>
    handleResponse<WeatherData>(api.get('/weather/forecast', { params: { city, lat, lon } })),
};

/* Currency API */
export const currencyApi = {
  getCurrencies: () => handleResponse<Record<string, string>>(api.get('/currency/currencies')),
  getRates: (base: string = 'USD') =>
    handleResponse<CurrencyRatesResponse>(api.get('/currency/rates', { params: { base } })),
  convert: (from: string, to: string, amount: number) =>
    handleResponse<CurrencyConversionResult>(
      api.get('/currency/convert', { params: { from, to, amount } })
    ),
  getHistory: () => handleResponse<CurrencyHistoryRecord[]>(api.get('/currency/history')),
};

/* Saved Items API */
export const savedApi = {
  saveItem: (data: {
    itemType: 'country' | 'weather' | 'currency';
    itemId: string;
    title: string;
    subtitle?: string;
    data?: any;
  }) => handleResponse<SavedItem>(api.post('/saved', data)),
  getSaved: (type?: string) => handleResponse<SavedItem[]>(api.get('/saved', { params: { type } })),
  deleteSaved: (id: string) => handleResponse<void>(api.delete(`/saved/${id}`)),
};

/* History API */
export const historyApi = {
  getHistory: (type?: string, limit?: number) =>
    handleResponse<SearchHistoryItem[]>(api.get('/history', { params: { type, limit } })),
  deleteHistory: (id: string) => handleResponse<void>(api.delete(`/history/${id}`)),
  clearAll: () => handleResponse<{ message: string }>(api.delete('/history')),
};

/* Admin API */
export const adminApi = {
  getStats: () => handleResponse<AdminStats>(api.get('/admin/stats')),
  getUsers: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params: { page, limit, search } }).then((res) => ({
      users: res.data.data,
      meta: res.data.meta,
    })),
  updateUser: (id: string, data: { role?: 'user' | 'admin'; isActive?: boolean }) =>
    handleResponse<User>(api.put(`/admin/users/${id}`, data)),
  deleteUser: (id: string) => handleResponse<void>(api.delete(`/admin/users/${id}`)),
  refreshCache: () => handleResponse<string>(api.post('/admin/cache/refresh')),
  clearCache: () => handleResponse<string>(api.post('/admin/cache/clear')),
};
