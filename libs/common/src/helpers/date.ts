import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns';
import { IsoDateTimeStamp } from '../types/date';

export const getNowAsUtcISOString = (): IsoDateTimeStamp =>
  `${formatInTimeZone(new Date(), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(new Date(), '+00:00', 'HH:mm:ss.SSS xxxxxx')}`;

/**
 * Returns the long month name associated with the given month number
 * @param monthNumber - 1-indexed month number
 * @returns month as a string
 */
export const getMonthName = (monthNumber: number) => {
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, monthNumber - 1);
  return format(date, 'MMMM');
};
