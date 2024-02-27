const moment = require('moment');

exports.formattedTimestamp = (timestamp) => {
  const utc = moment(parseInt(timestamp, 10));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.format() : '';
};
