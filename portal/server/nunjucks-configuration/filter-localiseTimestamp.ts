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
    throw new Error(`Cannot convert timestamp ${utcTimestamp} to date`);
  }

  const date = new Date(timestamp);

  return formatInTimeZone(date, targetTimezone, format);
};
