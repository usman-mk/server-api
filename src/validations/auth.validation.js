import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(30)
    .trim()
    .lowercase()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers and underscore',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .required()
    .min(6)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter and one number',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 100 characters'
    }),

  firstName: Joi.string()
    .allow('')
    .optional()
    .max(50)
    .trim(),

  lastName: Joi.string()
    .allow('')
    .optional()
    .max(50)
    .trim()
});

export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .trim()
    .lowercase(),

  password: Joi.string()
    .required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
}); 