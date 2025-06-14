import Vital from '../models/Vital.js';
import VitalLog from '../models/VitalLog.js';
import logger from './logger.service.js';
import { emitCreated, emitUpdated, emitDeleted } from './socket.service.js';
import cacheService from './cache.service.js';

class VitalService {
  /**
   * Create new vital data
   */
  async create(data) {
    // Create vital record
    const vital = await Vital.create(data);
    
    // Create log entry
    await VitalLog.create({
      type: 'CREATE',
      data: vital,
      vitalId: vital.id,
      createdBy: data.createdBy
    });

    // Clear all vital related caches
    await cacheService.clearVitalCache();

    // Emit socket event
    emitCreated('vital', vital, data.targetUsers);
    
    logger.info('Vital created:', { id: vital.id });
    return vital;
  }

  /**
   * Get the latest vital data
   */
  async getLatest() {
    // Try to get from cache
    const cacheKey = cacheService.KEYS.VITAL.LATEST;
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    // Get from database
    const latest = await Vital.findOne({
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ['updatedAt'] }
    });

    if (!latest) {
      return null;
    }

    // Set cache
    await cacheService.set(cacheKey, latest, cacheService.TTL.VITAL.LATEST);

    return latest;
  }

  /**
   * Get vital by ID
   */
  async getById(id) {
    // Try to get from cache
    const cacheKey = cacheService.KEYS.VITAL.DETAIL(id);
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    // Get from database
    const vital = await Vital.findByPk(id);
    
    if (!vital) {
      return null;
    }

    // Set cache
    await cacheService.set(cacheKey, vital, cacheService.TTL.VITAL.DETAIL);

    return vital;
  }

  /**
   * Update vital
   */
  async update(id, data) {
    const vital = await Vital.findByPk(id);
    
    if (!vital) {
      return null;
    }

    // Store old data for logging
    const oldData = vital.toJSON();

    // Update vital
    const updatedVital = await vital.update(data);

    // Create log entry
    await VitalLog.create({
      type: 'UPDATE',
      data: {
        old: oldData,
        new: updatedVital
      },
      vitalId: vital.id,
      createdBy: data.createdBy
    });

    // Clear all vital related caches
    await cacheService.clearVitalCache();

    // Emit socket event
    emitUpdated('vital', updatedVital, data.targetUsers);
    
    logger.info('Vital updated:', { id: updatedVital.id });
    return updatedVital;
  }

  /**
   * Delete vital
   */
  async delete(id, createdBy, targetUsers = null) {
    const vital = await Vital.findByPk(id);
    
    if (!vital) {
      return false;
    }

    // Store data for logging
    const deletedData = vital.toJSON();

    // Delete vital
    await vital.destroy();

    // Create log entry
    await VitalLog.create({
      type: 'DELETE',
      data: deletedData,
      vitalId: vital.id,
      createdBy
    });

    // Clear all vital related caches
    await cacheService.clearVitalCache();

    // Emit socket event
    emitDeleted('vital', { id }, targetUsers);
    
    logger.info('Vital deleted:', { id });
    return true;
  }

  /**
   * Get all vitals with pagination
   */
  async getAll(page = 1, limit = 10) {
    // Try to get from cache
    const cacheKey = cacheService.KEYS.VITAL.LIST(page, limit);
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const offset = (page - 1) * limit;

    // Get from database
    const { count, rows } = await Vital.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const result = {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    };

    // Set cache
    await cacheService.set(cacheKey, result, cacheService.TTL.VITAL.LIST);

    return result;
  }
}

export default new VitalService(); 