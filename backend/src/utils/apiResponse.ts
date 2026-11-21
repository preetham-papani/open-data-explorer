import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | any;
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

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  meta?: ApiResponse['meta'],
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: meta ? { ...meta, timestamp: new Date().toISOString() } : undefined,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  error?: string | any,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error || message,
  };
  return res.status(statusCode).json(response);
};
