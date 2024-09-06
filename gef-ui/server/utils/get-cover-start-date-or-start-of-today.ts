import { parseISO, startOfDay } from 'date-fns';
import { Facility } from '../types/facility';

export const getCoverStartDateOrStartOfToday = (facility: Facility): Date => {
  if (facility.coverStartDate) {
    return startOfDay(parseISO(facility.coverStartDate));
  }

  return startOfDay(new Date());
};
