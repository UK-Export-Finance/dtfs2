const moment = require('moment');

const formatDate = (day, month, year) => {
  const fourDigitYear = !year || year.length === 4 ? year : 20 + year.slice(-2).padStart(2, '0');

  const dt = moment([fourDigitYear, month - 1, day]);
  return dt.isValid() ? dt.format('DD-MM-YYYY') : '';
};

const formatTimestamp = (timestamp) => {
  const utc = moment(parseInt(timestamp, 10));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.format('DD-MM-YYYY') : '';
};

module.exports = {
  formatDate,
  formatTimestamp,
};
