import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AbuseRecord {
  count: number;
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
}

// In-memory store — replace with Redis for multi-instance production
const abuseStore = new Map<string, AbuseRecord>();

const WINDOW_MS = 60 * 1000;        // 1 minute window
const MAX_ERRORS = 20;              // Max 4xx/5xx before warning
const BLOCK_THRESHOLD = 50;         // Block after 50 errors in window
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minute block

/**
 * API Abuse Detection Middleware
 *
 * Tracks error rates per IP. Progressive: warns at MAX_ERRORS, blocks at BLOCK_THRESHOLD.
 * Designed to sit after the router so it can inspect response status codes.
 */
export const abuseDetectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';

  // Check if currently blocked
  const record = abuseStore.get(ip);
  if (record?.blocked) {
    const elapsed = Date.now() - record.lastSeen;
    if (elapsed < BLOCK_DURATION_MS) {
      res.status(429).json({
        success: false,
        message: 'Your IP has been temporarily blocked due to suspicious activity. Try again in 15 minutes.',
        statusCode: 429,
        data: null,
      });
      return;
    } else {
      // Unblock after duration
      abuseStore.delete(ip);
    }
  }

  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode >= 400) {
      const now = Date.now();
      const existing = abuseStore.get(ip);

      if (!existing || now - existing.firstSeen > WINDOW_MS) {
        // Reset window
        abuseStore.set(ip, { count: 1, firstSeen: now, lastSeen: now, blocked: false });
        return;
      }

      existing.count += 1;
      existing.lastSeen = now;

      if (existing.count >= BLOCK_THRESHOLD && !existing.blocked) {
        existing.blocked = true;
        logger.warn({
          event: 'api_abuse_blocked',
          ip,
          errorCount: existing.count,
          windowMs: WINDOW_MS,
        });
      } else if (existing.count >= MAX_ERRORS) {
        logger.warn({
          event: 'api_abuse_warning',
          ip,
          errorCount: existing.count,
        });
      }
    }
  });

  next();
};

// Cleanup stale records every 5 minutes — unref() so Jest exits cleanly
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of abuseStore.entries()) {
    if (now - record.lastSeen > BLOCK_DURATION_MS) {
      abuseStore.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();
