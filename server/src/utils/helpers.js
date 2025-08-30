const crypto = require('crypto');

const generateRandomToken = (length = 32) =>
  crypto.randomBytes(length).toString('hex');

const formatDateToISO = (date) => new Date(date).toISOString();

const calculateDiscountPrice = (price, discount, discountType) => {
  if (discountType === 'percentage') {
    return price - (price * (discount / 100));
  } else if (discountType === 'fixed') {
    return Math.max(price - discount, 0);
  }
  return price;
};

module.exports = {
  generateRandomToken,
  formatDateToISO,
  calculateDiscountPrice,
};
