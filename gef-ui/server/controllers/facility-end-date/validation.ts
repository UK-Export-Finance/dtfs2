import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput, DayMonthYearInput, FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { ErrorsOrDate } from '../../types/errors-or-date';
import { mapValidationError } from '../../utils/map-validation-error';

export const validateAndParseFacilityEndDate = (dayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrDate => {
  const errRef = 'facilityEndDate';
  const variableDisplayName = 'facility end date';

  const formattingErrorsOrDate = applyStandardValidationAndParseDateInput(dayMonthYear, variableDisplayName, errRef);

  if (formattingErrorsOrDate.error) {
    return {
      errors: [mapValidationError(formattingErrorsOrDate.error)],
    };
  }

  const facilityEndDate = formattingErrorsOrDate.parsedDate;

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
