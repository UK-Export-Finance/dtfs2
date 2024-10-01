import { applyStandardValidationAndParseDateInput, DayMonthYearInput } from '@ukef/dtfs2-common';
import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { BankRequestDateValidationViewModel } from '../../../../types/view-models';

const DATE_TOO_LATE_MESSAGE = 'The bank request date cannot exceed 12 months in the future from the submission date';
const DATE_TOO_EARLY_MESSAGE = 'The bank request date cannot exceed 12 months in the past from the submission date';

/**
 * Returns the error object containing the error summary text with links and the inline error text with refs
 * @private
 * @param message the error message to display in the summary and inline
 * @param refs a list of the specific date fields the error message relates to
 */
export const getErrorObjectFromMessageAndRefs = (message: string, refs: string[]) => {
  return {
    errors: {
      summary: [{ text: message, href: `#${refs[0]}` }],
      bankRequestDateError: { message, fields: refs },
    },
  };
};

/**
 * @param date The entered bank request date
 * @returns a reason for cancelling errors view model
 */
export const validateBankRequestDate = (date: DayMonthYearInput): BankRequestDateValidationViewModel => {
  const { error, parsedDate } = applyStandardValidationAndParseDateInput(date, 'bank request date', 'bank-request-date');

  if (error) {
    return getErrorObjectFromMessageAndRefs(error.message, error.fieldRefs);
  }

  const today = startOfDay(new Date());
  const twelveMonthsFromToday = add(today, { months: 12 });
  const twelveMonthsInPast = add(today, { months: -12 });

  // checks if the entered bank request date is not beyond 12 months in the future
  if (isAfter(parsedDate, twelveMonthsFromToday)) {
    return getErrorObjectFromMessageAndRefs(DATE_TOO_LATE_MESSAGE, ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year']);
  }

  // checks if the entered bank request date is not beyond 12 months in the past
  if (isBefore(parsedDate, twelveMonthsInPast)) {
    return getErrorObjectFromMessageAndRefs(DATE_TOO_EARLY_MESSAGE, ['bank-request-date-day', 'bank-request-date-month', 'bank-request-date-year']);
  }

  return {
    bankRequestDate: startOfDay(parsedDate),
    errors: null,
  };
};
