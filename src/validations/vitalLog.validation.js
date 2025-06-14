import Joi from 'joi';

export const createVitalLog = Joi.object({
  vitalId: Joi.number().integer().positive().required(),
  action: Joi.string().valid('CREATE', 'UPDATE', 'DELETE').required(),
  changes: Joi.object().required(),
  createdBy: Joi.string().required()
});

export const updateVitalLog = Joi.object({
  vitalId: Joi.number().integer().positive(),
  action: Joi.string().valid('CREATE', 'UPDATE', 'DELETE'),
  changes: Joi.object(),
  createdBy: Joi.string().required()
}); 