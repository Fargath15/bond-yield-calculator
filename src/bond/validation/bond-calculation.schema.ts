import Joi from 'joi';

export const bondCalculationSchema = Joi.object({
  faceValue: Joi.number().positive().required(),
  couponRate: Joi.number().min(0).max(100).required(),
  marketPrice: Joi.number().positive().required(),
  yearsToMaturity: Joi.number().positive().required(),
  frequency: Joi.number().integer().positive().valid(1,2,4).required(),
});

