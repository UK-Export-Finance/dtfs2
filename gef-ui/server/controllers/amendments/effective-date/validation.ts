import {
  UnixTimestampSeconds,
  applyStandardValidationAndParseDateInput,
  DayMonthYearInput,
  DATE_FORMATS,
  AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_PAST,
  AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_FUTURE,
} from '@ukef/dtfs2-common';
import { add, sub, isAfter, isBefore, startOfDay, format, getUnixTime } from 'date-fns';
import { ErrorsOrValue } from '../../../types/errors-or-value';
import { mapValidationError } from '../../../utils/map-validation-error';

/**
 * @param params
 * @param params.dayMonthYear - The cover end date as a DayMonthYearInput object
 * @param params.coverStartDate - The cover start date as Date
 * @returns the value or errors depending on the validation result
 */
export const validateAndParseEffectiveDate = (dayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrValue<UnixTimestampSeconds> => {
  const errRef = 'effectiveDate';
  const variableDisplayName = 'date amendment effective from';

  const formattingErrorsOrDate = applyStandardValidationAndParseDateInput(dayMonthYear, variableDisplayName, errRef);

  if (formattingErrorsOrDate.error) {
    return {
      errors: [mapValidationError(formattingErrorsOrDate.error)],
    };
  }

  const effectiveDate = formattingErrorsOrDate.parsedDate;
  const now = startOfDay(new Date());
  const earliestEffectiveDateDate = sub(now, { days: AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_PAST });
  const latestEffectiveDateDate = add(now, { days: AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_FUTURE });

  if (isBefore(effectiveDate, coverStartDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `Date amendment effective from cannot be before the cover start date ${format(coverStartDate, DATE_FORMATS.D_MMMM_YYYY)}`,
          subFieldErrorRefs: ['effectiveDate-day', 'effectiveDate-month', 'effectiveDate-year'],
        },
      ],
    };
  }

  if (isBefore(effectiveDate, earliestEffectiveDateDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `The date entered is invalid. Please ensure the date entered does not exceed the allowable timeframe`,
          subFieldErrorRefs: ['effectiveDate-day', 'effectiveDate-month', 'effectiveDate-year'],
        },
      ],
    };
  }

  if (isAfter(effectiveDate, latestEffectiveDateDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `You entered an amendment date more than ${AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_FUTURE} days from now. Amendments must be effective within the next ${AMENDMENT_MAXIMUM_EFFECTIVE_DATE_DAYS_IN_FUTURE} days - come back later or use the Schedule 8 form`,
          subFieldErrorRefs: ['effectiveDate-day', 'effectiveDate-month', 'effectiveDate-year'],
        },
      ],
    };
  }

  return { value: getUnixTime(effectiveDate) };
};
