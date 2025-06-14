import { Router } from 'express';
import * as vitalController from '../controllers/vital.controller.js';
import validationService from '../../services/validation.service.js';

const router = Router();

// Get all vitals with pagination
router.get(
  '/',
  validationService.middleware.validatePagination,
  vitalController.getVitals
);

// Get latest vital data
router.get(
  '/latest',
  vitalController.getLatestVital
);

// Create new vital
router.post(
  '/',
  validationService.middleware.validateCreateVital,
  vitalController.createVital
);

// Get vital by ID
router.get(
  '/:id',
  validationService.middleware.validateId,
  vitalController.getVitalById
);

// Update vital
router.put(
  '/:id',
  validationService.middleware.validateId,
  validationService.middleware.validateUpdateVital,
  vitalController.updateVital
);

// Delete vital
router.delete(
  '/:id',
  validationService.middleware.validateId,
  vitalController.deleteVital
);

export default router; 