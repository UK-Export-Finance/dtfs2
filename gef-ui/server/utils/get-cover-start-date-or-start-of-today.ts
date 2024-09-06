import { parseISO, startOfDay } from 'date-fns';
import { AnyObject } from '@ukef/dtfs2-common';

export const getCoverStartDateOrStartOfToday = (facility: AnyObject): Date => {
  if (typeof facility.coverStartDate === 'string') {
    return startOfDay(parseISO(facility.coverStartDate));
  }

  if (!facility.coverStartDate) {
    return startOfDay(new Date());
  }

  throw new Error('Invalid coverStartDate');
};
