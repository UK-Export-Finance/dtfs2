const moment = require('moment');
require('moment-timezone');// monkey-patch to provide moment().tz()

const filterLocaliseTimestamp = (utcTimestamp, format, targetTimezone) => {
  // usability guidelines suggest not rendering blanks,
  //  so if we're asked to render a blank: give -something-
  if (!utcTimestamp) {
    return '-';
  }

  const utc = moment(parseInt(utcTimestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  return localisedTimestamp.format(format);
};

export default filterLocaliseTimestamp;
