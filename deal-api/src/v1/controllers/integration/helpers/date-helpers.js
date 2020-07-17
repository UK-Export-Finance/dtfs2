const moment = require('moment');

const formatDate = (day, month, year) => {
  const dt = moment([year, month, day]);
  return dt.isValid() ? dt.format('DD-MM-YYYY') : '';
};

module.exports = {
  formatDate,
};
