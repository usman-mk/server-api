import { Router } from 'express';
import { config } from '../../config/index.js';

const router = Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: config.version
  });
});

export default router; 