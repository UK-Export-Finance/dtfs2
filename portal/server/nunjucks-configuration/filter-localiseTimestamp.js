const moment = require('moment');
require('moment-timezone');// monkey-patch to provide moment().tz()

const filterLocaliseTimestamp = (utcTimestamp, format, targetTimezone) => {
  const utc = moment(utcTimestamp);
  const localisedTimestamp = utc.tz(targetTimezone);
  return localisedTimestamp.format(format);
};

export default filterLocaliseTimestamp;
