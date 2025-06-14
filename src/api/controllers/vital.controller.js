import Vital from '../../database/models/vital.model.js';
import errorService from '../../services/error.service.js';
import logger from '../../services/logger.service.js';

/**
 * Create new vital data
 */
export const createVital = async (req, res, next) => {
  try {
    const vital = await Vital.create(req.body);
    logger.info('Vital created:', { id: vital.id });
    res.status(201).json(vital);
  } catch (error) {
    next(error);
  }
};

/**
 * Get the latest vital data
 */
export const getLatestVital = async (req, res, next) => {
  try {
    const latest = await Vital.findOne({ order: [['createdAt', 'DESC']] });
    
    if (!latest) {
      throw errorService.createNotFoundError('Latest vital data');
    }

    res.json(latest);
  } catch (error) {
    next(error);
  }
};

/**
 * Get vital by ID
 */
export const getVitalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vital = await Vital.findByPk(id);
    
    if (!vital) {
      throw errorService.createNotFoundError('Vital');
    }

    res.json(vital);
  } catch (error) {
    next(error);
  }
};

/**
 * Update vital
 */
export const updateVital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vital = await Vital.findByPk(id);

    if (!vital) {
      throw errorService.createNotFoundError('Vital');
    }

    await vital.update(req.body);
    logger.info('Vital updated:', { id });
    res.json(vital);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vital
 */
export const deleteVital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vital = await Vital.findByPk(id);

    if (!vital) {
      throw errorService.createNotFoundError('Vital');
    }

    await vital.destroy();
    logger.info('Vital deleted:', { id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get all vitals with pagination
 */
export const getVitals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    const vitals = await Vital.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: vitals.rows,
      pagination: {
        total: vitals.count,
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
}; 