import Joi from 'joi';

export const createVital = Joi.object({
  temperature: Joi.number().required(),
  heartRate: Joi.number().integer().required(),
  bloodPressure: Joi.object({
    systolic: Joi.number().integer().required(),
    diastolic: Joi.number().integer().required()
  }).required(),
  respiratoryRate: Joi.number().integer().required(),
  oxygenSaturation: Joi.number().min(0).max(100).required(),
  createdBy: Joi.string().required()
});

export const updateVital = Joi.object({
  temperature: Joi.number(),
  heartRate: Joi.number().integer(),
  bloodPressure: Joi.object({
    systolic: Joi.number().integer(),
    diastolic: Joi.number().integer()
  }),
  respiratoryRate: Joi.number().integer(),
  oxygenSaturation: Joi.number().min(0).max(100),
  createdBy: Joi.string().required()
}); 