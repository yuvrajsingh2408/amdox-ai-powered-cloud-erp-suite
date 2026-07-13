import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Custom Log Format (Dev) ───────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

// ─── Production JSON Format ────────────────────────────────────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'amdox-erp-backend',
    version: process.env.npm_package_version || '1.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
  ],
  exitOnError: false,
});

// ─── File transports for production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 20 * 1024 * 1024, // 20 MB
      maxFiles: 10,
    })
  );
}

export default logger;
