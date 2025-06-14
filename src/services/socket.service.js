import { Server } from 'socket.io';
import logger from './logger.service.js';
import { config } from '../config/index.js';

let io;

/**
 * Initialize Socket.IO server
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Update this in production
      methods: ['GET', 'POST']
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    logger.info('Client connected:', socket.id);

    // Join room based on userId
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.info('User joined room', { userId, socketId: socket.id });
      }
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitToAll = (event, data) => {
  try {
    io.emit(event, data);
    logger.debug('Socket emitted to all', { event });
  } catch (error) {
    logger.error('Socket emit to all failed', { event, error });
  }
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitToUser = (userId, event, data) => {
  try {
    io.to(`user:${userId}`).emit(event, data);
    logger.debug('Socket emitted to user', { userId, event });
  } catch (error) {
    logger.error('Socket emit to user failed', { userId, event, error });
  }
};

/**
 * Emit event to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitToUsers = (userIds, event, data) => {
  try {
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit(event, data);
    });
    logger.debug('Socket emitted to users', { userIds, event });
  } catch (error) {
    logger.error('Socket emit to users failed', { userIds, event, error });
  }
};

// Event types for CRUD operations
export const SOCKET_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted'
};

/**
 * Emit create event
 * @param {string} resource - Resource name (e.g., 'vital', 'user')
 * @param {any} data - Created data
 * @param {string|string[]|null} [target] - Target user(s) or null for broadcast
 */
export const emitCreated = (resource, data, target = null) => {
  const event = `${resource}:${SOCKET_EVENTS.CREATED}`;
  if (!target) {
    emitToAll(event, data);
  } else if (Array.isArray(target)) {
    emitToUsers(target, event, data);
  } else {
    emitToUser(target, event, data);
  }
};

/**
 * Emit update event
 * @param {string} resource - Resource name (e.g., 'vital', 'user')
 * @param {any} data - Updated data
 * @param {string|string[]|null} [target] - Target user(s) or null for broadcast
 */
export const emitUpdated = (resource, data, target = null) => {
  const event = `${resource}:${SOCKET_EVENTS.UPDATED}`;
  if (!target) {
    emitToAll(event, data);
  } else if (Array.isArray(target)) {
    emitToUsers(target, event, data);
  } else {
    emitToUser(target, event, data);
  }
};

/**
 * Emit delete event
 * @param {string} resource - Resource name (e.g., 'vital', 'user')
 * @param {any} data - Deleted data or ID
 * @param {string|string[]|null} [target] - Target user(s) or null for broadcast
 */
export const emitDeleted = (resource, data, target = null) => {
  const event = `${resource}:${SOCKET_EVENTS.DELETED}`;
  if (!target) {
    emitToAll(event, data);
  } else if (Array.isArray(target)) {
    emitToUsers(target, event, data);
  } else {
    emitToUser(target, event, data);
  }
};

export { io }; 