import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../../config/index.js';
import healthRoutes from './health.routes.js';
import vitalRoutes from './vital.routes.js';
import vitalLogRoutes from './vitalLog.routes.js';

const router = Router();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

router.use(apiLimiter);

// Mount routes
router.use('/health', healthRoutes);
router.use('/vitals', vitalRoutes);
router.use('/vital-logs', vitalLogRoutes);

export default router;
