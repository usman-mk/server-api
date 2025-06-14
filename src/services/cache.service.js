import IORedis from 'ioredis';
import { config } from '../config/index.js';
import logger from './logger.service.js';

class CacheService {
  constructor() {
    this.isConnected = false;
    this.isEnabled = true;
    this.initRedis();

    // Cache key prefixes
    this.KEYS = {
      VITAL: {
        DETAIL: (id) => `vital:${id}`,
        LIST: (page = 1, limit = 10) => `vital:list:${page}:${limit}`,
        LATEST: 'vital:latest',
        ALL_PATTERN: 'vital:*'
      }
    };

    // Cache TTL in seconds
    this.TTL = {
      VITAL: {
        DETAIL: config.cache.ttl || 60,
        LIST: config.cache.ttl || 60,
        LATEST: config.cache.ttl || 30
      }
    };
  }

  /**
   * Initialize Redis connection
   */
  initRedis() {
    try {
      this.redis = new IORedis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, config.redis.retryDelay);
          return times >= 3 ? null : delay; // Stop retrying after 3 attempts
        },
        reconnectOnError(err) {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        }
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.handleConnectionError(error);
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
        this.isEnabled = true;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

    } catch (error) {
      logger.error('Redis initialization error:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Handle Redis connection error
   */
  handleConnectionError(error) {
    this.isConnected = false;
    
    // If connection fails repeatedly, disable cache
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      this.isEnabled = false;
      logger.warn('Cache service disabled due to connection issues');
    }
  }

  /**
   * Check if cache is available
   */
  isCacheAvailable() {
    return this.isEnabled && this.isConnected;
  }

  /**
   * Set cache with TTL
   */
  async set(key, data, ttl = 60) {
    if (!this.isCacheAvailable()) {
      return false;
    }

    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
      logger.debug('Cache set:', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error:', { key, error });
      return false;
    }
  }

  /**
   * Get cache
   */
  async get(key) {
    if (!this.isCacheAvailable()) {
      return null;
    }

    try {
      const data = await this.redis.get(key);
      if (data) {
        logger.debug('Cache hit:', { key });
        return JSON.parse(data);
      }
      logger.debug('Cache miss:', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  /**
   * Delete cache by key
   */
  async delete(key) {
    if (!this.isCacheAvailable()) {
      return false;
    }

    try {
      await this.redis.del(key);
      logger.debug('Cache deleted:', { key });
      return true;
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
      return false;
    }
  }

  /**
   * Delete cache by pattern
   */
  async deleteByPattern(pattern) {
    if (!this.isCacheAvailable()) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        logger.debug('Cache deleted by pattern:', { pattern, count: keys.length });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Cache delete by pattern error:', { pattern, error });
      return false;
    }
  }

  /**
   * Clear all vital related caches
   */
  async clearVitalCache() {
    if (!this.isCacheAvailable()) {
      return false;
    }

    try {
      await this.deleteByPattern(this.KEYS.VITAL.ALL_PATTERN);
      logger.info('All vital caches cleared');
      return true;
    } catch (error) {
      logger.error('Clear vital cache error:', error);
      return false;
    }
  }

  /**
   * Get cache status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isConnected: this.isConnected,
      isAvailable: this.isCacheAvailable()
    };
  }

  /**
   * Enable cache service
   */
  enable() {
    this.isEnabled = true;
    logger.info('Cache service enabled');
    if (!this.isConnected) {
      this.initRedis();
    }
  }

  /**
   * Disable cache service
   */
  disable() {
    this.isEnabled = false;
    logger.info('Cache service disabled');
  }
}

export default new CacheService(); 