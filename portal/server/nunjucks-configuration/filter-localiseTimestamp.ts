import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a given timestamp in a timezone, returns an empty string if no timestamp
 * is provided
 * @param utcTimestamp milliseconds since midnight 1970 UTC
 * @param format Unicode date token string
 * @param targetTimezone IANA time zone name or offset string (e.g. 'Europe/London')
 * @returns
 *
 * https://www.npmjs.com/package/date-fns-tz#formatintimezone
 */
export const filterLocaliseTimestamp = (utcTimestamp: number | string, format: string, targetTimezone: string): string => {
  if (!utcTimestamp) {
    return '';
  }
  const timestamp = parseInt(String(utcTimestamp), 10);

  if (Number.isNaN(timestamp)) {
    return 'Invalid date';
  }

  const date = new Date(timestamp);

  return formatInTimeZone(date, targetTimezone, format);
};
