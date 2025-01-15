import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { format } from 'date-fns';

/**
 * @param date - the date to convert
 * @returns the date as a DayMonthYearInput object
 */
export const convertDateToDayMonthYearInput = (date: Date): DayMonthYearInput => {
  return {
    day: format(date, 'd'),
    month: format(date, 'M'),
    year: format(date, 'yyyy'),
  };
};
