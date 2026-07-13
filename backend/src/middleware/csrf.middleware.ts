import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-Submit Cookie CSRF Protection
 *
 * On GET requests: Issues a signed CSRF token in a SameSite=Strict cookie.
 * On mutating requests: Validates that the request header matches the cookie value.
 *
 * Skipped for:
 *  - Safe HTTP methods (GET, HEAD, OPTIONS)
 *  - API-key authenticated routes (x-api-key header present)
 *  - Webhook endpoints (/api/webhooks)
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Skip for safe methods
  if (SAFE_METHODS.has(req.method)) {
    // Issue CSRF token on GET if not present
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,          // JS must be able to read it to send the header
        sameSite: process.env.VERCEL ? 'none' : 'strict',
        secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    return next();
  }

  // Skip for webhook routes and API-key auth
  if (req.path.startsWith('/api/webhooks') || req.headers['x-api-key']) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string;

  if (!cookieToken || !headerToken) {
    logger.warn({
      event: 'csrf_missing_token',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please refresh the page.',
      statusCode: 403,
      data: null,
    });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  const cookieBuf = Buffer.from(cookieToken);
  const headerBuf = Buffer.from(headerToken);

  if (
    cookieBuf.length !== headerBuf.length ||
    !crypto.timingSafeEqual(cookieBuf, headerBuf)
  ) {
    logger.warn({
      event: 'csrf_token_mismatch',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed. Please refresh and try again.',
      statusCode: 403,
      data: null,
    });
    return;
  }

  next();
};
