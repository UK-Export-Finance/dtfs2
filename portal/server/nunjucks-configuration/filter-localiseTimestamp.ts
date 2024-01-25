import { formatInTimeZone } from 'date-fns-tz';

export const filterLocaliseTimestamp = (
  utcTimestamp: number,
  format: string,
  targetTimezone: string,
) => {
  if (!utcTimestamp) {
    return '';
  }
  const date = new Date(utcTimestamp);

  return formatInTimeZone(date, targetTimezone, format);
};
