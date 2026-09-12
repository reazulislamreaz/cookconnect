import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/shared/ApiError';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'Route not found'));
}

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = (req as Request & { requestId?: string }).requestId;

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errorSources: err.errorSources,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
      ...(requestId ? { requestId } : {}),
    });
    return;
  }

  logger.error('Unhandled error', {
    err,
    requestId,
    path: req.path,
  });

  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: 'Internal server error',
    errorSources: [],
    ...(env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
    ...(requestId ? { requestId } : {}),
  });
}
