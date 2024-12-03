import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { uniq } from 'lodash';
import { DayMonthYearInput, FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { ErrorsOrDate } from '../../types/errors-or-date';

export const validateAndParseFacilityEndDate = (dayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrDate => {
  const errRef = 'facilityEndDate';

  const formattingErrorsOrDate = validateAndParseDayMonthYear(dayMonthYear, {
    errRef,
    variableDisplayName: 'facility end date',
  });

  if ('errors' in formattingErrorsOrDate) {
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
  const maximumFacilityEndDate = add(now, { years: FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE });

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
          errMsg: `Facility end date cannot be greater than ${FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE} years in the future`,
          subFieldErrorRefs: ['facilityEndDate-day', 'facilityEndDate-month', 'facilityEndDate-year'],
        },
      ],
    };
  }

  return { date: facilityEndDate };
};
