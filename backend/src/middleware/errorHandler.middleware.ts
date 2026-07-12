import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Log non-operational errors
  if (!err.isOperational) {
    console.error('💥 SYSTEM ERROR:', err);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`⚠️ OPERATIONAL ERROR: [${statusCode}] - ${message}`);
  }

  // Handle Prisma Known Request Errors (P2002: unique constraint violation, etc.)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? (err.meta.target as string[]).join(', ') : 'field';
    return sendResponse({
      res,
      statusCode: 409,
      success: false,
      message: `Duplicate value for unique constraint: ${fields}`,
      error: err.meta || null,
    });
  }

  if (err.code === 'P2025') {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: err.meta?.cause || 'Resource not found in database',
      error: err.meta || null,
    });
  }

  // General AppError
  if (err instanceof AppError) {
    return sendResponse({
      res,
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
  }

  // Default response
  return sendResponse({
    res,
    statusCode,
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};
