const Joi = require("joi");

const schemas = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('ATTENDEE', 'ORGANIZER').default('ATTENDEE')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  createEvent: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    categoryId: Joi.string().uuid().optional(),
    startAt: Joi.date().iso().greater('now').required(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
    timezone: Joi.string().optional(),
    isVirtual: Joi.boolean().default(false),
    venueName: Joi.string().max(200).optional(),
    street: Joi.string().max(200).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    virtualLink: Joi.string().uri().optional(),
    capacity: Joi.number().integer().min(1).optional(),
    visibility: Joi.string().valid('PUBLIC', 'PRIVATE', 'UNLISTED').default('PUBLIC'),
    ticketTypes: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('early-bird', 'regular', 'vip').required(),
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).optional(),
        price: Joi.number().min(0).required(),
        currency: Joi.string().length(3).default('INR'),
        quantity: Joi.number().integer().min(1).required(),
        perUserLimit: Joi.number().integer().min(1).max(50).default(10),
        saleStart: Joi.date().iso().optional(),
        saleEnd: Joi.date().iso().optional()
      })
    ).min(1).required()
  }),
  
  createBooking: Joi.object({
    eventId: Joi.string().uuid().required(),
    ticketItems: Joi.array().items(
      Joi.object({
        ticketTypeId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).max(50).required()
      })
    ).min(1).required(),
    attendees: Joi.array().items(
      Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().max(20).optional(),
        ticketType: Joi.string().valid('early-bird', 'regular', 'vip').required()
      })
    ).min(1).required(),
    promoCode: Joi.string().max(50).optional()
  }),
  
  createCategory: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    sortOrder: Joi.number().integer().min(0).default(0)
  }),

  createPromotion: Joi.object({
    code: Joi.string().min(3).max(50).required(),
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    discountType: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
    value: Joi.number().min(0).required(),
    maxDiscount: Joi.number().min(0).optional(),
    validFrom: Joi.date().iso().optional(),
    validTo: Joi.date().iso().greater(Joi.ref('validFrom')).optional(),
    totalLimit: Joi.number().integer().min(1).optional(),
    perUserLimit: Joi.number().integer().min(1).optional(),
    minimumAmount: Joi.number().min(0).optional(),
    minimumQuantity: Joi.number().integer().min(1).optional(),
    eventIds: Joi.array().items(Joi.string().uuid()).optional()
  }),

  validatePromoCode: Joi.object({
    code: Joi.string().required(),
    eventId: Joi.string().uuid().required(),
    totalAmount: Joi.number().min(0).required(),
    userId: Joi.string().uuid().optional()
  }),

  initiatePayment: Joi.object({
    bookingId: Joi.string().uuid().required(),
    provider: Joi.string().valid('stripe', 'razorpay', 'paypal').default('stripe')
  }),

  confirmPayment: Joi.object({
    paymentId: Joi.string().uuid().required(),
    providerTxnId: Joi.string().required()
  })
};

module.exports = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errorDetails
      });
    }

    req.body = value; // Use validated and sanitized data
    next();
  };
};
