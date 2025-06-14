import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import User from '../database/models/user.model.js';
import { tokenService } from '../services/token.service.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if user still exists and is active
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Validate token in storage
    const isValid = await tokenService.validateToken(user.id, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Token has been revoked or expired' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(error);
  }
}; 