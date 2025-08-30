const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  ATTENDEE: 'attendee',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

module.exports = {
  ROLES,
  PAYMENT_STATUS,
  BOOKING_STATUS,
};
