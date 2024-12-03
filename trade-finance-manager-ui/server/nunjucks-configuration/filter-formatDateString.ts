import { format, isValid, parse } from 'date-fns';

/**
 * @param dateStr date string formatted as fromFormat
 * @param fromFormat date format using {@link https://date-fns.org/v3.3.1/docs/format | unicode tokens}
 * @param toFormat date format using {@link https://date-fns.org/v3.3.1/docs/format | unicode tokens}
 * @returns date formatted as toFormat or 'Invalid date' if can't parse dateStr
 */
export const formatDateString = (dateStr: string, fromFormat: string, toFormat: string = 'd MMM yyyy') => {
  const date = parse(dateStr, fromFormat, new Date());
  return isValid(date) ? format(date, toFormat) : 'Invalid date';
};
