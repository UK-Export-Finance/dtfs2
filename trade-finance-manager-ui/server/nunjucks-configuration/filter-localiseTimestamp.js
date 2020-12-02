import moment from 'moment';

require('moment-timezone');// monkey-patch to provide moment().tz()

const filterLocaliseTimestamp = (utcTimestamp, format, targetTimezone) => {
  console.log('localiseTimestamp................ ', utcTimestamp);
  console.log('localiseTimestamp................ format', format);
  console.log('localiseTimestamp................ targetTimezone', targetTimezone);

  if (!utcTimestamp) {
    return '';
  }

  const utc = moment(parseInt(utcTimestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  return localisedTimestamp.format(format);
};

export default filterLocaliseTimestamp;
