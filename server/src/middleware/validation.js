const Joi = require("joi");

const schemas = {
  register: Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  booking: Joi.object({
    ticketId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
  })
};

module.exports = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    next();
  };
};
