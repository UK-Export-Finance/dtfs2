const moment = require('moment');

// TODO: DTFS2-6998: remove this function
const formattedTimestamp = (timestamp) => {
  const utc = moment(parseInt(timestamp, 10));
  const dt = moment(utc);
  return moment(dt).isValid() ? dt.format() : '';
};

module.exports = formattedTimestamp;
