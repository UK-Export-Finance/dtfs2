import { formatInTimeZone } from 'date-fns-tz';

// Previously this used moment.js which uses its own formatting tokens. Date-fns uses Unicode. For now
// to maintain compatibility this will take the moment.js date and year tokens and convert them to Unicode
// https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
const mapDateAndYearTokensToUnicode = (format) => (
  format.replace('YYYY', 'yyyy')
    .replace('DD', 'dd')
    .replace('YY', 'yy')
    .replace('D', 'd')
);

const filterLocaliseTimestamp = (utcTimestamp, format, targetTimezone) => {
  if (!utcTimestamp) {
    return '';
  }
  const date = new Date(utcTimestamp);

  const unicodeFormat = mapDateAndYearTokensToUnicode(format);

  return formatInTimeZone(date, targetTimezone, unicodeFormat);
};

export default filterLocaliseTimestamp;
