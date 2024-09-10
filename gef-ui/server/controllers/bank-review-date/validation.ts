import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { uniq } from 'lodash';
import { DayMonthYearInput, FACILITY_END_DATE_MAXIMUM_YEARS_IN_FUTURE } from '@ukef/dtfs2-common';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { ErrorsOrDate } from '../../types/errors-or-date';

export const validateAndParseBankReviewDate = (bankReviewDayMonthYear: DayMonthYearInput, coverStartDate: Date): ErrorsOrDate => {
  const errRef = 'bankReviewDate';

  const formattingErrorsOrDate = validateAndParseDayMonthYear(bankReviewDayMonthYear, {
    errRef,
    variableDisplayName: 'bank review date',
  });

  if ('errors' in formattingErrorsOrDate) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Bank review date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: uniq(formattingErrorsOrDate.errors.flatMap((error) => error.subFieldErrorRefs ?? [])),
        },
      ],
    };
  }

  const bankReviewDate = formattingErrorsOrDate.date;

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

  return { date: bankReviewDate };
};
