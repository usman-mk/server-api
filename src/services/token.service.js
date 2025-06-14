import Redis from 'ioredis';
import { Op } from 'sequelize';
import { config } from '../config/index.js';
import Token from '../database/models/token.model.js';
import logger from './logger.service.js';

class TokenService {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    if (config.jwt.storage.redis.enabled) {
      this.redis = new Redis(config.jwt.storage.redis.url);
      logger.info('Redis token storage initialized');
    }
  }

  async storeToken(userId, token, expiresIn, req) {
    try {
      const expiresAt = new Date(Date.now() + this.parseExpiresIn(expiresIn));
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const deviceInfo = this.parseUserAgent(userAgent);

      // Store in Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        await this.redis.setex(
          key,
          Math.floor(this.parseExpiresIn(expiresIn) / 1000),
          token
        );
        logger.debug(`Stored token in Redis for user ${userId}`);
      }

      // Store in Database if enabled
      if (config.jwt.storage.database.enabled) {
        await Token.create({
          userId,
          token,
          type: 'access',
          expiresAt,
          ipAddress,
          userAgent,
          deviceInfo
        });
        logger.debug(`Stored token in database for user ${userId}`);
      }
    } catch (error) {
      logger.error('Error storing token:', error);
      throw error;
    }
  }

  async storeRefreshToken(userId, token, expiresIn, req) {
    try {
      const expiresAt = new Date(Date.now() + this.parseExpiresIn(expiresIn));
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const deviceInfo = this.parseUserAgent(userAgent);

      // Store in Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}refresh:${userId}`;
        await this.redis.setex(
          key,
          Math.floor(this.parseExpiresIn(expiresIn) / 1000),
          token
        );
      }

      // Store in Database if enabled
      if (config.jwt.storage.database.enabled) {
        await Token.create({
          userId,
          token,
          expiresAt,
          ipAddress,
          userAgent,
          deviceInfo,
          type: 'refresh'
        });
      }
    } catch (error) {
      logger.error('Error storing refresh token:', error);
      throw error;
    }
  }

  getClientIp(req) {
    if (!req) return null;
    
    return req.ip || 
           req.headers?.['x-forwarded-for']?.split(',')[0] || 
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           null;
  }

  parseUserAgent(userAgent) {
    if (!userAgent) return null;

    const deviceInfo = {
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      device: this.detectDevice(userAgent)
    };

    return deviceInfo;
  }

  detectBrowser(ua) {
    const browsers = {
      chrome: /chrome|chromium|crios/i,
      safari: /safari/i,
      firefox: /firefox|fxios/i,
      edge: /edge|edg/i,
      opera: /opera|opr/i,
      ie: /msie|trident/i
    };

    for (const [name, regex] of Object.entries(browsers)) {
      if (regex.test(ua)) {
        const version = ua.match(/(?:chrome|chromium|crios|safari|firefox|fxios|edge|edg|opera|opr|msie|trident)[/\s](\d+(\.\d+)?)/i);
        return {
          name,
          version: version ? version[1] : 'unknown'
        };
      }
    }

    return {
      name: 'unknown',
      version: 'unknown'
    };
  }

  detectOS(ua) {
    const os = {
      windows: /windows nt/i,
      mac: /macintosh|mac os x/i,
      linux: /linux/i,
      android: /android/i,
      ios: /iphone|ipad|ipod/i
    };

    for (const [name, regex] of Object.entries(os)) {
      if (regex.test(ua)) {
        const version = ua.match(/(?:windows nt|mac os x|android) ([0-9._]+)/i);
        return {
          name,
          version: version ? version[1] : 'unknown'
        };
      }
    }

    return {
      name: 'unknown',
      version: 'unknown'
    };
  }

  detectDevice(ua) {
    let type = 'desktop';
    let vendor = 'unknown';
    let model = 'unknown';

    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      type = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      type = 'tablet';
    }

    if (/iphone|ipad|ipod/i.test(ua)) {
      vendor = 'Apple';
    } else if (/android/i.test(ua)) {
      vendor = ua.match(/android .+ ([^;]+(?=\)))/i)?.[1] || 'unknown';
    }

    return { type, vendor, model };
  }

  async validateToken(userId, token) {
    try {
      // Check Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        const storedToken = await this.redis.get(key);
        if (storedToken === token) {
          return true;
        }
      }

      // Check Database if enabled
      if (config.jwt.storage.database.enabled) {
        const tokenRecord = await Token.findOne({
          where: {
            userId,
            token,
            isRevoked: false,
            expiresAt: {
              [Op.gt]: new Date()
            }
          }
        });
        if (tokenRecord) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Error validating token:', error);
      throw error;
    }
  }

  async validateRefreshToken(userId, token) {
    try {
      // Check Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}refresh:${userId}`;
        const storedToken = await this.redis.get(key);
        if (storedToken === token) {
          return true;
        }
      }

      // Check Database if enabled
      if (config.jwt.storage.database.enabled) {
        const tokenRecord = await Token.findOne({
          where: {
            userId,
            token,
            type: 'refresh',
            isRevoked: false,
            expiresAt: {
              [Op.gt]: new Date()
            }
          }
        });
        if (tokenRecord) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Error validating refresh token:', error);
      throw error;
    }
  }

  async revokeToken(userId, token) {
    try {
      // Remove from Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        await this.redis.del(key);
      }

      // Update in Database if enabled
      if (config.jwt.storage.database.enabled) {
        await Token.update(
          { isRevoked: true },
          {
            where: {
              userId,
              token
            }
          }
        );
      }
    } catch (error) {
      logger.error('Error revoking token:', error);
      throw error;
    }
  }

  async revokeRefreshToken(userId, token) {
    try {
      // Remove from Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}refresh:${userId}`;
        await this.redis.del(key);
      }

      // Update in Database if enabled
      if (config.jwt.storage.database.enabled) {
        await Token.update(
          { isRevoked: true },
          {
            where: {
              userId,
              token,
              type: 'refresh'
            }
          }
        );
      }
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  async revokeAllUserTokens(userId) {
    try {
      // Revoke all tokens in Database if enabled
      if (config.jwt.storage.database.enabled) {
        await Token.update(
          { isRevoked: true },
          {
            where: {
              userId,
              isRevoked: false
            }
          }
        );
      }

      // Remove token from Redis if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        await this.redis.del(key);

        // Also remove refresh token if exists
        const refreshKey = `${config.jwt.storage.redis.prefix}refresh:${userId}`;
        await this.redis.del(refreshKey);
      }
    } catch (error) {
      logger.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  parseExpiresIn(expiresIn) {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return value;
    }
  }

  async getActiveSessionCount(userId) {
    try {
      let count = 0;

      // Count Redis sessions if enabled
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        const token = await this.redis.get(key);
        if (token) {
          logger.debug(`Found active Redis session for user ${userId}`);
          count++;
        }
      }

      // Count Database sessions if enabled
      if (config.jwt.storage.database.enabled) {
        const dbCount = await Token.count({
          where: {
            userId,
            type: 'access',  // Only count access tokens
            isRevoked: false,
            expiresAt: {
              [Op.gt]: new Date()
            }
          }
        });
        logger.debug(`Found ${dbCount} active database sessions for user ${userId}`);
        count += dbCount;
      }

      logger.info(`Total active sessions for user ${userId}: ${count}`);
      return count;
    } catch (error) {
      logger.error('Error getting active session count:', error);
      throw error;
    }
  }

  async revokeOldestToken(userId) {
    try {
      logger.info(`Attempting to revoke oldest token for user ${userId}`);

      // Find oldest token in Database if enabled
      if (config.jwt.storage.database.enabled) {
        const oldestToken = await Token.findOne({
          where: {
            userId,
            type: 'access',  // Only consider access tokens
            isRevoked: false,
            expiresAt: {
              [Op.gt]: new Date()
            }
          },
          order: [['createdAt', 'ASC']]
        });

        if (oldestToken) {
          logger.info(`Found oldest token in database for user ${userId}, created at ${oldestToken.createdAt}`);
          await oldestToken.update({ isRevoked: true });
          
          // Also revoke corresponding refresh token if exists
          await Token.update(
            { isRevoked: true },
            {
              where: {
                userId,
                type: 'refresh',
                createdAt: oldestToken.createdAt
              }
            }
          );
        }
      }

      // For Redis, just remove the current token since it's the only one
      if (config.jwt.storage.redis.enabled) {
        const key = `${config.jwt.storage.redis.prefix}${userId}`;
        const exists = await this.redis.exists(key);
        if (exists) {
          logger.info(`Revoking Redis token for user ${userId}`);
          await this.redis.del(key);
          
          // Also remove refresh token if exists
          const refreshKey = `${config.jwt.storage.redis.prefix}refresh:${userId}`;
          await this.redis.del(refreshKey);
        }
      }
    } catch (error) {
      logger.error('Error revoking oldest token:', error);
      throw error;
    }
  }

  async getActiveSessions(userId) {
    try {
      if (config.jwt.storage.database.enabled) {
        return await Token.findAll({
          where: {
            userId,
            isRevoked: false,
            expiresAt: {
              [Op.gt]: new Date()
            }
          },
          order: [['createdAt', 'DESC']]
        });
      }
      return [];
    } catch (error) {
      logger.error('Error getting active sessions:', error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();