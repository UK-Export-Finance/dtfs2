import { UnixTimestampSeconds, applyStandardValidationAndParseDateInput, DayMonthYearInput, COVER_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { add, isAfter, isBefore, startOfDay, getUnixTime } from 'date-fns';
import { ErrorsOrValue } from '../../../types/errors-or-value';
import { mapValidationError } from '../../../utils/map-validation-error';

/**
 * @param params.dayMonthYear - The cover end date as a DayMonthYearInput object
 * @param params.dayMonthYear - The cover start date as Date
 * @returns the value or errors depending on the validation result
 */
export const validateAndParseCoverEndDate = (dayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrValue<UnixTimestampSeconds> => {
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

  return { value: getUnixTime(coverEndDate) };
};
