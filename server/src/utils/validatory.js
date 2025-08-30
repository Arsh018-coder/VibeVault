const validator = require('validator');

const isEmail = (email) => validator.isEmail(email);

const isNonEmptyString = (str) => typeof str === 'string' && str.trim().length > 0;

const isValidDate = (date) => !isNaN(Date.parse(date));

const isPositiveInteger = (num) => Number.isInteger(num) && num > 0;

module.exports = {
  isEmail,
  isNonEmptyString,
  isValidDate,
  isPositiveInteger,
};
