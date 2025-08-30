const { format, differenceInDays } = require('date-fns');

const formatDate = (date, dateFormat = 'yyyy-MM-dd') => format(new Date(date), dateFormat);

const daysBetween = (startDate, endDate) => differenceInDays(new Date(endDate), new Date(startDate));

module.exports = {
  formatDate,
  daysBetween,
};
