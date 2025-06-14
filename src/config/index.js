import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  timezone: process.env.TZ || 'Asia/Bangkok',
  version: process.env.npm_package_version || '1.0.0',
  
  // API Configuration
  api: {
    basePath: process.env.API_BASE_PATH || '/api'
  },

  // Database
  database: {
    name: process.env.DB_NAME || 'vital_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    },
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 1000,
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60, // Default 60 seconds
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    
    // File rotation
    rotation: {
      enabled: process.env.LOG_ROTATE_ENABLED === 'true',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
    },

    // Log cleanup
    cleanup: {
      enabled: process.env.LOG_CLEANUP_ENABLED === 'true',
      maxAge: parseInt(process.env.LOG_MAX_AGE, 10) || 14, // days
      schedule: process.env.LOG_CLEANUP_SCHEDULE || '0 0 * * *' // every day at midnight
    },

    types: {
      app: {
        enabled: process.env.LOG_APP_ENABLED !== 'false',
        filename: process.env.LOG_APP_FILENAME || 'application.log'
      },
      error: {
        enabled: process.env.LOG_ERROR_ENABLED !== 'false',
        filename: process.env.LOG_ERROR_FILENAME || 'error.log'
      },
      http: {
        enabled: process.env.LOG_HTTP_ENABLED !== 'false',
        filename: process.env.LOG_HTTP_FILENAME || 'http.log'
      },
      api: {
        enabled: process.env.LOG_API_ENABLED !== 'false',
        filename: process.env.LOG_API_FILENAME || 'api.log'
      },
      exception: {
        enabled: process.env.LOG_EXCEPTION_ENABLED !== 'false',
        filename: process.env.LOG_EXCEPTION_FILENAME || 'exception.log'
      },
      rejection: {
        enabled: process.env.LOG_REJECTION_ENABLED !== 'false',
        filename: process.env.LOG_REJECTION_FILENAME || 'rejection.log'
      }
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per windowMs
  },

  // Queue configuration
  queue: {
    name: process.env.QUEUE_NAME || 'insertQueue',
    jobTTL: parseInt(process.env.JOB_TTL, 10) || 24 * 3600, // 24 hours
    jobRetention: parseInt(process.env.JOB_RETENTION, 10) || 24 * 3600, // 24 hours
    maxJobs: parseInt(process.env.MAX_JOBS, 10) || 1000,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5,
    limiterMax: parseInt(process.env.QUEUE_LIMITER_MAX, 10) || 100,
    limiterDuration: parseInt(process.env.QUEUE_LIMITER_DURATION, 10) || 1000,
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
}; 