import { formatInTimeZone } from 'date-fns-tz';

/**
 * @returns- Returns the current datetime as an ISO-8601 string
 * @example
 * '2024-04-08T11:06:59.579 +00:00'
 */
export const getNowAsUtcISOString = () =>
  `${formatInTimeZone(new Date(), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(new Date(), '+00:00', 'HH:mm:ss.SSS xxxxxx')}`;
