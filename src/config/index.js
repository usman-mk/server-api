import 'dotenv/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  timezone: process.env.TZ || 'Asia/Bangkok',
  version: process.env.npm_package_version || '1.0.0',
  bodyLimit: process.env.BODY_LIMIT || '1mb',
  
  // API Configuration
  api: {
    basePath: process.env.API_BASE_PATH || '/api',
    versioning: {
      enabled: process.env.API_VERSIONING_ENABLED === 'true',
      version: process.env.API_VERSION || 'v1'
    },
    timeout: parseInt(process.env.API_TIMEOUT, 10) || 30000
  },

  // Auth Configuration
  auth: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    session: {
      idleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT, 10) || 1800,
      absoluteTimeout: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT, 10) || 43200
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refresh: {
      enabled: process.env.REFRESH_TOKEN_ENABLED === 'true',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    },
    blacklist: {
      enabled: process.env.TOKEN_BLACKLIST_ENABLED === 'true',
      ttl: parseInt(process.env.TOKEN_BLACKLIST_TTL, 10) || 86400
    },
    storage: {
      type: process.env.TOKEN_STORAGE_TYPE || 'redis',
      redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        prefix: 'token:'
      },
      database: {
        enabled: true
      }
    },
    multipleLogin: {
      enabled: process.env.MULTIPLE_LOGIN_ENABLED === 'true' || false,
      maxSessions: parseInt(process.env.MAX_SESSIONS) || 1
    }
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'vital_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
    },
    ssl: {
      enabled: process.env.DB_SSL_ENABLED === 'true',
      caPath: process.env.DB_SSL_CA_PATH
    },
    timeout: {
      connection: {
        enabled: process.env.DB_TIMEOUT_ENABLED === 'true',
        ms: parseInt(process.env.DB_TIMEOUT, 10) || 5000
      },
      query: {
        enabled: process.env.DB_QUERY_TIMEOUT_ENABLED === 'true',
        ms: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 30000
      }
    }
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS, 10) || 10,
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 2000,
    cluster: {
      enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
      nodes: (process.env.REDIS_CLUSTER_NODES || '').split(',')
    },
    sentinel: {
      enabled: process.env.REDIS_SENTINEL_ENABLED === 'true',
      nodes: (process.env.REDIS_SENTINEL_NODES || '').split(','),
      master: process.env.REDIS_SENTINEL_MASTER || 'mymaster'
    }
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    type: process.env.CACHE_TYPE || 'redis',
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60,
    compression: {
      enabled: process.env.CACHE_COMPRESSION_ENABLED === 'true',
      threshold: parseInt(process.env.CACHE_COMPRESSION_THRESHOLD, 10) || 1024
    }
  },

  // Security Configuration
  security: {
    csrf: {
      enabled: process.env.CSRF_ENABLED === 'true',
      secret: process.env.CSRF_SECRET
    },
    xss: {
      enabled: process.env.XSS_ENABLED === 'true'
    },
    sqlInjection: {
      enabled: process.env.SQL_INJECTION_PROTECTION_ENABLED === 'true'
    },
    requestValidation: {
      enabled: process.env.REQUEST_VALIDATION_ENABLED === 'true'
    }
  },

  // Logging Configuration
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
      maxAge: parseInt(process.env.LOG_MAX_AGE, 10) || 14,
      schedule: process.env.LOG_CLEANUP_SCHEDULE || '0 0 * * *'
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

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    slidingWindow: process.env.RATE_LIMIT_SLIDING_WINDOW === 'true',
    separatePaths: process.env.RATE_LIMIT_SEPARATE_PATHS === 'true'
  },

  // Queue Configuration
  queue: {
    name: process.env.QUEUE_NAME || 'insertQueue',
    jobTTL: parseInt(process.env.JOB_TTL, 10) || 24 * 3600,
    jobRetention: parseInt(process.env.JOB_RETENTION, 10) || 24 * 3600,
    maxJobs: parseInt(process.env.MAX_JOBS, 10) || 1000,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5,
    limiterMax: parseInt(process.env.QUEUE_LIMITER_MAX, 10) || 100,
    limiterDuration: parseInt(process.env.QUEUE_LIMITER_DURATION, 10) || 1000
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      path: process.env.HEALTH_CHECK_PATH || '/health'
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      path: process.env.METRICS_PATH || '/metrics'
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      type: process.env.TRACING_TYPE || 'jaeger',
      endpoint: process.env.TRACING_ENDPOINT
    }
  },

  // Documentation Configuration
  docs: {
    swagger: {
      enabled: process.env.SWAGGER_ENABLED === 'true',
      path: process.env.SWAGGER_PATH || '/api-docs'
    }
  }
}; 