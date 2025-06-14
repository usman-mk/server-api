import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../config/index.js';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom format for logging
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Ensure logs directory exists
const logDir = path.join(process.cwd(), config.log.dir);

// Create logger instance
const logger = createLogger({
  level: config.log.level,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    })
  ]
});

// Add file transports if rotation is enabled
if (config.log.rotation.enabled) {
  // App logs
  logger.add(new transports.DailyRotateFile({
    dirname: logDir,
    filename: 'app-%DATE%.log',
    datePattern: config.log.rotation.datePattern,
    maxSize: config.log.rotation.maxSize,
    maxFiles: config.log.rotation.maxFiles
  }));

  // Error logs
  logger.add(new transports.DailyRotateFile({
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: config.log.rotation.datePattern,
    maxSize: config.log.rotation.maxSize,
    maxFiles: config.log.rotation.maxFiles,
    level: 'error'
  }));
}

// HTTP request logging
logger.httpRequest = (req, res, responseTime) => {
  // Don't log health check requests
  if (req.url === '/health') {
    return;
  }

  const status = res.statusCode;
  const level = status >= 400 ? 'error' : 'info';
  
  logger.log(level, 'HTTP Request', {
    method: req.method,
    url: req.url,
    status,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent') || '-',
    ip: req.ip
  });
};

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export default logger; 