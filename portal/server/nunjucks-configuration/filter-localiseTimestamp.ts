import { formatInTimeZone } from 'date-fns-tz';

export const filterLocaliseTimestamp = (
  utcTimestamp: number | string,
  format: string,
  targetTimezone: string,
) => {
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
