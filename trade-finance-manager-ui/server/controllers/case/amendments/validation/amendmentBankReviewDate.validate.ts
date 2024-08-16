import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { applyStandardValidationAndParseDateInput, DayMonthYearInput } from '@ukef/dtfs2-common';

type ErrorOrBankReviewDate =
  | {
      error: { summary: { text: string }[]; fields: string[] };
    }
  | { bankReviewDate: Date; error: null };

export const bankReviewDateValidation = (date: DayMonthYearInput, coverStartDate: Date): ErrorOrBankReviewDate => {
  const { error: standardError, parsedDate } = applyStandardValidationAndParseDateInput(date, 'bank review date', 'bank-review-date');

  if (standardError) {
    return {
      error: {
        summary: [{ text: standardError.message }],
        fields: standardError.fieldRefs,
      },
    };
  }

  const today = startOfDay(new Date());
  const sixYearsFromToday = add(today, { years: 6 });
  const coverStartDateToCompare = startOfDay(coverStartDate);

  // checks if the entered bank review date is greater than 6 years in the future
  if (isAfter(parsedDate, sixYearsFromToday)) {
    return {
      error: {
        summary: [{ text: 'Bank review date cannot be greater than 6 years in the future' }],
        fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
      },
    };
  }

  // checks if the entered bank review date is before the cover start date
  if (isBefore(parsedDate, coverStartDateToCompare)) {
    return {
      error: {
        summary: [{ text: 'The bank review date cannot be before the cover start date' }],
        fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
      },
    };
  }

  return {
    bankReviewDate: parsedDate,
    error: null,
  };
};
