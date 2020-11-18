const moment = require('moment');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());

const formatDate = (day, month, year) => {
  const fourDigitYear = formatYear(year);

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
  formatYear,
};
