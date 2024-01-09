import { eachMonthOfInterval, format, isValid, parseISO } from 'date-fns';
import { isString } from './string';
import { IsoMonthStamp, OneIndexedMonth } from '../types/date';

/**
 * Converts date with index-0 month value to numeric index-1 month
 */
export const getOneIndexedMonth = (date: Date): OneIndexedMonth => date.getMonth() + 1;

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

export const isValidIsoMonth = (value: unknown): value is IsoMonthStamp => isString(value) && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));

export const toIsoMonthStamp = (date: Date): IsoMonthStamp => format(date, 'yyyy-MM');

type EachIsoMonthOfIntervalOptions = {
  exclusive?: boolean;
};

export const eachIsoMonthOfInterval = (start: IsoMonthStamp, end: IsoMonthStamp, options?: EachIsoMonthOfIntervalOptions): IsoMonthStamp[] => {
  const monthsBetweenDatesInclusive = eachMonthOfInterval({ start: new Date(start), end: new Date(end) });
  const resultDates = options?.exclusive ? monthsBetweenDatesInclusive.slice(1, -1) : monthsBetweenDatesInclusive;
  return resultDates.map(toIsoMonthStamp);
};
