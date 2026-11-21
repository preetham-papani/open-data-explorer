import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('💥 [Server Error]:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    sendError(res, 'Validation Error', messages.join(', '), 400);
    return;
  }

  // Handle Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid resource identifier format: ${err.value}`, null, 400);
    return;
  }

  // Handle MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    sendError(res, `A record with that ${field} ('${value}') already exists.`, null, 409);
    return;
  }

  // Handle Axios / External API errors
  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    const externalMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'External public service communication failure';
    sendError(res, `External API error: ${externalMessage}`, null, status);
    return;
  }

  // Fallback internal server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  sendError(res, message, null, statusCode);
};
