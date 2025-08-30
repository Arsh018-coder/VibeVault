// User roles matching Prisma enum
const ROLES = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  ATTENDEE: 'ATTENDEE',
};

// Payment status matching Prisma enum
const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Booking status matching Prisma enum
const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

// Event visibility matching Prisma enum
const VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED',
};

// Event status matching Prisma enum
const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Discount type matching Prisma enum
const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
};

// Notification types
const NOTIFICATION_TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  SYSTEM: 'system',
  PUSH: 'push',
};

// Notification status
const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
};

// Notification priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Ticket types
const TICKET_TYPE = {
  EARLY_BIRD: 'early-bird',
  REGULAR: 'regular',
  VIP: 'vip',
};

// Ticket type validation helper
const TICKET_TYPE_CONFIG = {
  'early-bird': {
    name: 'Early Bird',
    description: 'Limited time discounted tickets',
    order: 1
  },
  'regular': {
    name: 'Regular',
    description: 'Standard admission tickets',
    order: 2
  },
  'vip': {
    name: 'VIP',
    description: 'Premium experience with exclusive benefits',
    order: 3
  }
};

// Payment providers
const PAYMENT_PROVIDER = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
};

// Currency codes
const CURRENCY = {
  INR: 'INR',
  USD: 'USD',
  EUR: 'EUR',
};

// Default values
const DEFAULTS = {
  CURRENCY: 'INR',
  ROLE: 'ATTENDEE',
  PER_USER_LIMIT: 1,
  LOYALTY_POINTS: 0,
  EVENT_CAPACITY: 100,
  TICKET_PRICE: 0,
};

// Validation constants
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MIN_PRICE: 0,
  MAX_PRICE: 999999,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 1000,
};

module.exports = {
  ROLES,
  PAYMENT_STATUS,
  BOOKING_STATUS,
  VISIBILITY,
  EVENT_STATUS,
  DISCOUNT_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  TICKET_TYPE,
  TICKET_TYPE_CONFIG,
  PAYMENT_PROVIDER,
  CURRENCY,
  DEFAULTS,
  VALIDATION,
};