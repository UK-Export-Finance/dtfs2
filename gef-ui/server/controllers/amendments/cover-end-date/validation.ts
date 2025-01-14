import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput, DayMonthYearInput, COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { ErrorsOrValue } from '../../../types/errors-or-value';
import { mapValidationError } from '../../../utils/map-validation-error';

export const validateAndParseCoverEndDate = (dayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrValue<Date> => {
  const errRef = 'coverEndDate';
  const variableDisplayName = 'cover end date';

  const formattingErrorsOrDate = applyStandardValidationAndParseDateInput(dayMonthYear, variableDisplayName, errRef);

  if (formattingErrorsOrDate.error) {
    return {
      errors: [mapValidationError(formattingErrorsOrDate.error)],
    };
  }

  const coverEndDate = formattingErrorsOrDate.parsedDate;

  const now = startOfDay(new Date());
  const maximumCoverEndDate = add(now, { years: COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE });

  if (isBefore(coverEndDate, coverStartDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'The new cover end date must be after the cover start date',
          subFieldErrorRefs: ['coverEndDate-day', 'coverEndDate-month', 'coverEndDate-year'],
        },
      ],
    };
  }

  if (isAfter(coverEndDate, maximumCoverEndDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `The new cover end date cannot be greater than ${COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE} years in the future`,
          subFieldErrorRefs: ['coverEndDate-day', 'coverEndDate-month', 'coverEndDate-year'],
        },
      ],
    };
  }

  return { value: coverEndDate };
};
