const moment = require('moment');

const formatDate = (day, month, year) => {
  const dt = moment([year, month, day]);
  return dt.isValid() ? dt.format('DD-MM-YYYY') : '';
};

const formatTimestamp = (timestamp, userTimezone) => {
  const targetTimezone = userTimezone;
  const utc = moment(parseInt(timestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  const formatted = moment(localisedTimestamp).format('DD-MM-YYYY');
};

module.exports = {
  formatDate,
  formatTimestamp,
};
