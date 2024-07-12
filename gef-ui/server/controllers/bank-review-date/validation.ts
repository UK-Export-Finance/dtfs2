import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { uniq } from 'lodash';
import { validateAndParseDayMonthYear } from '../../utils/day-month-year-validation';
import { DayMonthYear } from '../../types/date';

export const validateAndParseBankReviewDate = (dayMonthYear: DayMonthYear, coverStartDate: Date) => {
  const errRef = 'bankReviewDate';

  const formattingErrorsOrDate = validateAndParseDayMonthYear(dayMonthYear, {
    errRef,
    variableDisplayName: 'bank review date',
  });

  if (formattingErrorsOrDate.errors) {
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
  const nowPlusSixYears = add(now, { years: 6 });

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

  if (isAfter(bankReviewDate, nowPlusSixYears)) {
    return {
      errors: [
        {
          errRef,
          errMsg: 'Bank review date cannot be greater than 6 years in the future',
          subFieldErrorRefs: ['bankReviewDate-day', 'bankReviewDate-month', 'bankReviewDate-year'],
        },
      ],
    };
  }

  return { errors: null, date: bankReviewDate };
};
