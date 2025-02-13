import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput, DayMonthYearInput, FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { ErrorsOrValue } from '../../types/errors-or-value';
import { mapValidationError } from '../../utils/map-validation-error';

export const validateAndParseBankReviewDate = (bankReviewDayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrValue<Date> => {
  const errRef = 'bankReviewDate';
  const variableDisplayName = 'bank review date';

  const formattingErrorsOrDate = applyStandardValidationAndParseDateInput(bankReviewDayMonthYear, variableDisplayName, errRef);

  if (formattingErrorsOrDate.error) {
    return {
      errors: [mapValidationError(formattingErrorsOrDate.error)],
    };
  }

  const bankReviewDate = formattingErrorsOrDate.parsedDate;

  const now = startOfDay(new Date());
  const maximumBankReviewDate = add(now, { years: FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE });

  if (isBefore(bankReviewDate, coverStartDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Bank review date cannot be before the cover start date',
          subFieldErrorRefs: ['bankReviewDate-day', 'bankReviewDate-month', 'bankReviewDate-year'],
        },
      ],
    };
  }

  if (isAfter(bankReviewDate, maximumBankReviewDate)) {
    return {
      errors: [
        {
          errRef,
          errMsg: `Bank review date cannot be greater than ${FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE} years in the future`,
          subFieldErrorRefs: ['bankReviewDate-day', 'bankReviewDate-month', 'bankReviewDate-year'],
        },
      ],
    };
  }

  return { value: bankReviewDate };
};
