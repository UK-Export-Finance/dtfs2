import { parseISO, startOfDay } from 'date-fns';
import { Facility } from '../types/facility';

export const getCoverStartDateOrStartOfToday = (facility: Facility): Date => {
  if (typeof facility.coverStartDate === 'string') {
    return startOfDay(parseISO(facility.coverStartDate));
  }

  if (!facility.coverStartDate) {
    return startOfDay(new Date());
  }

  throw new Error('Invalid coverStartDate');
};
