const Joi = require("joi");

exports.authUser = Joi.object({
  password: Joi.string().required(),
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  // address: Joi.string().required(),
  listAs: Joi.string().required(),
  // gender: Joi.string().required(),
  // phone: Joi.string().required(),
});

exports.authProduct = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  stock: Joi.string().required(),
  description: Joi.string().optional(),
});

exports.authTransaction = Joi.object({
  checkin: Joi.string().required(),
  checkout: Joi.string().required(),
  total: Joi.number().required(),
  propertyId: Joi.number().required(),
  userId: Joi.number().required(),
  ownerId: Joi.number().required(),
  duration: Joi.string().required(),
  status: Joi.string(),
  attachment: Joi.string(),
});
