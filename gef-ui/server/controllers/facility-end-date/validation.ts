import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { uniq } from 'lodash';
import { FACILITY_END_DATE_MAXIMUM_YEARS } from '@ukef/dtfs2-common';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { DayMonthYear } from '../../types/date';

export const validateAndParseFacilityEndDate = (dayMonthYear: DayMonthYear, coverStartDate: Date) => {
  const errRef = 'facilityEndDate';

  const formattingErrorsOrDate = validateAndParseDayMonthYear(dayMonthYear, {
    errRef,
    variableDisplayName: 'facility end date',
  });

  if (formattingErrorsOrDate.errors) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Facility end date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: uniq(formattingErrorsOrDate.errors.flatMap((error) => error.subFieldErrorRefs ?? [])),
        },
      ],
    };
  }

  const facilityEndDate = formattingErrorsOrDate.date;

  const now = startOfDay(new Date());
  const maximumFacilityEndDate = add(now, { years: FACILITY_END_DATE_MAXIMUM_YEARS });

  if (isBefore(facilityEndDate, coverStartDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Facility end date cannot be before the cover start date',
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    };
  }

  if (isAfter(facilityEndDate, maximumFacilityEndDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `Facility end date cannot be greater than ${FACILITY_END_DATE_MAXIMUM_YEARS} years in the future`,
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    };
  }

  return { errors: null, date: facilityEndDate };
};
