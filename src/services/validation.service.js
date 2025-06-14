import Joi from 'joi';
import errorService from './error.service.js';
import * as commonValidation from '../validations/common.validation.js';
import * as vitalValidation from '../validations/vital.validation.js';
import * as vitalLogValidation from '../validations/vitalLog.validation.js';

class ValidationService {
  /**
   * Validate request data against schema
   */
  validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const errors = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      throw errorService.createValidationError(errors);
    }

    return value;
  }

  /**
   * Common validation schemas
   */
  schemas = {
    id: Joi.number().integer().positive().required(),
    
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    vital: {
      create: Joi.object({
        temperature: Joi.number().required(),
        heartRate: Joi.number().integer().required(),
        bloodPressure: Joi.object({
          systolic: Joi.number().integer().required(),
          diastolic: Joi.number().integer().required()
        }).required(),
        respiratoryRate: Joi.number().integer().required(),
        oxygenSaturation: Joi.number().min(0).max(100).required(),
        createdBy: Joi.string().required()
      }),

      update: Joi.object({
        temperature: Joi.number(),
        heartRate: Joi.number().integer(),
        bloodPressure: Joi.object({
          systolic: Joi.number().integer(),
          diastolic: Joi.number().integer()
        }),
        respiratoryRate: Joi.number().integer(),
        oxygenSaturation: Joi.number().min(0).max(100),
        createdBy: Joi.string().required()
      })
    }
  };

  /**
   * Validation middleware factory
   */
  createValidator(schema) {
    return (req, res, next) => {
      try {
        const validated = this.validate(req.body, schema);
        req.body = validated;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Common validation middleware
   */
  middleware = {
    validateId: (req, res, next) => {
      try {
        const { id } = req.params;
        this.validate({ id }, Joi.object({ id: commonValidation.id }));
        next();
      } catch (error) {
        next(error);
      }
    },

    validatePagination: (req, res, next) => {
      try {
        const validated = this.validate(req.query, commonValidation.pagination);
        req.query = { ...req.query, ...validated };
        next();
      } catch (error) {
        next(error);
      }
    },

    validateCreateVital: this.createValidator(vitalValidation.createVital),
    validateUpdateVital: this.createValidator(vitalValidation.updateVital),

    validateCreateVitalLog: this.createValidator(vitalLogValidation.createVitalLog),
    validateUpdateVitalLog: this.createValidator(vitalLogValidation.updateVitalLog)
  };
}

export default new ValidationService(); 