import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/logging.middleware.js';
import { config } from './config/index.js';
import routes from './api/routes/index.js';
import logger from './services/logger.service.js';
import { initDatabase } from './database/db.js';
import { initSocket } from './services/socket.service.js';

export class App {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max
    }));

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use(requestLogger);
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // API routes with configurable base path
    const basePath = config.api.basePath;
    logger.info(`Setting up API routes with base path: ${basePath}`);
    this.app.use(basePath, routes);
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  async init() {
    try {
      // Initialize database
      await initDatabase();
      
      // Create HTTP server
      const { createServer } = await import('http');
      this.server = createServer(this.app);

      // Initialize socket.io
      initSocket(this.server);

      return this;
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  async start() {
    try {
      const port = config.port;
      this.server.listen(port, () => {
        logger.info(`Server running at http://localhost:${port} in ${config.env} mode`);
        logger.info(`API available at http://localhost:${port}${config.api.basePath}`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      
      if (this.server) {
        await this.server.close();
      }
      
      process.exit(0);
    });
  }
}

export default new App(); 