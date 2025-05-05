// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log full stack in console for debugging
  console.error(err.stack || err);

  // Determine HTTP status
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Build error payload
  const payload: Record<string, any> = {
    status: 'error',
    message,
  };

  // Include stack trace only when developing
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
