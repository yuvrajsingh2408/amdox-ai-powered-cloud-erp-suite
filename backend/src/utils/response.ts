import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode: number;
  success: boolean;
  message: string;
  data?: T | null;
  error?: any | null;
}

export const sendResponse = <T>({
  res,
  statusCode,
  success,
  message,
  data = null,
  error = null,
}: ApiResponseOptions<T>): Response => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
    statusCode,
  });
};

export default sendResponse;
