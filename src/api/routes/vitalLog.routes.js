import { Router } from 'express';
import * as vitalLogController from '../controllers/vitalLog.controller.js';
import validationService from '../../services/validation.service.js';

const router = Router();

// Get all vital logs with pagination
router.get(
  '/',
  validationService.middleware.validatePagination,
  vitalLogController.getVitalLogs
);

// Create new vital log
router.post('/',
  validationService.middleware.validateCreateVitalLog,
  vitalLogController.createVitalLog
);

// Get vital log by ID
router.get(
  '/:id',
  validationService.middleware.validateId,
  vitalLogController.getVitalLogById
);

// Update vital log
router.put('/:id',
  validationService.middleware.validateId,
  validationService.middleware.validateUpdateVitalLog,
  vitalLogController.updateVitalLog
);

// Delete vital log
router.delete('/:id',
  validationService.middleware.validateId,
  vitalLogController.deleteVitalLog
);

// Get vital logs by vital ID
router.get('/vital/:vitalId', vitalLogController.getVitalLogsByVitalId);

export default router; 