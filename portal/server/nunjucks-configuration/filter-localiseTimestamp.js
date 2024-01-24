const { formatInTimeZone } = require('date-fns-tz');

const filterLocaliseTimestamp = (utcTimestamp, format, targetTimezone) => {
  if (!utcTimestamp) {
    return '';
  }
  const date = new Date(utcTimestamp);

  return formatInTimeZone(date, targetTimezone, format);
};

module.exports = filterLocaliseTimestamp;
