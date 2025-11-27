import { startOfDay } from 'date-fns';
import { Facility } from '../types/facility';

export const getCoverStartDateOrToday = (facility: Facility): Date => {
  if (facility.coverStartDate) {
    const coverStartDate = new Date(facility.coverStartDate);

    return startOfDay(coverStartDate);
  }

  return startOfDay(new Date());
};
