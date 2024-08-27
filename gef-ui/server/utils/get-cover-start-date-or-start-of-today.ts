import { parseISO, startOfDay } from 'date-fns';

export const getCoverStartDateOrStartOfToday = (facility: Record<string, unknown>): Date => {
  if (typeof facility.coverStartDate === 'string') {
    return startOfDay(parseISO(facility.coverStartDate));
  }

  if (!facility.coverStartDate) {
    return startOfDay(new Date());
  }

  throw new Error('Invalid coverStartDate');
};
