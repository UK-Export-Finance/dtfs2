const moment = require('moment');

exports.dateIsInTimeframe = (day, month, year, start, end) => {
  const formattedDate = moment(`${year}-${month}-${day}`);
  const isInTimeframe = moment(formattedDate).isBetween(start, end, 'days', '[]');

  if (isInTimeframe) {
    return true;
  }
  return false;
};
