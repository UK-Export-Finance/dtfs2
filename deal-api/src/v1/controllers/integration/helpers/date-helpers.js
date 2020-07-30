const moment = require('moment');

const formatDate = (day, month, year) => {
  const dt = moment([year, month, day]);
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
