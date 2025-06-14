import { VitalLog } from '../../database/models/vitalLog.model.js';
import errorService from '../../services/error.service.js';
import logger from '../../services/logger.service.js';
import { io } from '../../services/socket.service.js';

/**
 * Create a new vital log
 */
export const createVitalLog = async (req, res, next) => {
  try {
    const vitalLog = await VitalLog.create(req.body);
    
    // Emit socket event
    io.emit('vitalLog:created', vitalLog);
    
    logger.info('VitalLog created:', { id: vitalLog.id });
    res.status(201).json(vitalLog);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all vital logs with pagination
 */
export const getVitalLogs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    const vitalLogs = await VitalLog.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: vitalLogs.rows,
      pagination: {
        total: vitalLogs.count,
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vital log by ID
 */
export const getVitalLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vitalLog = await VitalLog.findByPk(id);

    if (!vitalLog) {
      throw errorService.createNotFoundError('VitalLog');
    }

    res.json(vitalLog);
  } catch (error) {
    next(error);
  }
};

/**
 * Update vital log
 */
export const updateVitalLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vitalLog = await VitalLog.findByPk(id);

    if (!vitalLog) {
      throw errorService.createNotFoundError('VitalLog');
    }

    await vitalLog.update(req.body);
    
    // Emit socket event
    io.emit('vitalLog:updated', vitalLog);
    
    logger.info('VitalLog updated:', { id });
    res.json(vitalLog);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vital log
 */
export const deleteVitalLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vitalLog = await VitalLog.findByPk(id);

    if (!vitalLog) {
      throw errorService.createNotFoundError('VitalLog');
    }

    await vitalLog.destroy();
    
    // Emit socket event
    io.emit('vitalLog:deleted', { id });
    
    logger.info('VitalLog deleted:', { id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get vital logs by vital ID
 */
export const getVitalLogsByVitalId = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await VitalLog.findAndCountAll({
      where: {
        vitalId: req.params.vitalId
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (err) {
    errorService.handleError(err, req, res);
  }
}; 