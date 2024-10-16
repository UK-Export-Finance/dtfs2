import { applyStandardValidationAndParseDateInput, DayMonthYearInput } from '@ukef/dtfs2-common';
import { add, isAfter, isBefore, startOfDay } from 'date-fns';
import { EffectiveFromDateValidationViewModel } from '../../../../types/view-models';

const DATE_TOO_LATE_MESSAGE = 'The effective date cannot exceed 12 months in the future from the submission date';
const DATE_TOO_EARLY_MESSAGE = 'The effective date cannot exceed 12 months in the past from the submission date';

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
      effectiveFromDateError: { message, fields: refs },
    },
  };
};

/**
 * @param date The entered effective from date
 * @returns a reason for cancelling errors view model
 */
export const validateEffectiveFromDate = (date: DayMonthYearInput): EffectiveFromDateValidationViewModel => {
  const { error, parsedDate } = applyStandardValidationAndParseDateInput(date, 'date effective from', 'effective-from-date');

  if (error) {
    return getErrorObjectFromMessageAndRefs(error.message, error.fieldRefs);
  }

  const today = startOfDay(new Date());
  const twelveMonthsFromToday = add(today, { months: 12 });
  const twelveMonthsInPast = add(today, { months: -12 });

  // checks if the entered effective from date is not beyond 12 months in the future
  if (isAfter(parsedDate, twelveMonthsFromToday)) {
    return getErrorObjectFromMessageAndRefs(DATE_TOO_LATE_MESSAGE, ['effective-from-date-day', 'effective-from-date-month', 'effective-from-date-year']);
  }

  // checks if the entered effective from date is not beyond 12 months in the past
  if (isBefore(parsedDate, twelveMonthsInPast)) {
    return getErrorObjectFromMessageAndRefs(DATE_TOO_EARLY_MESSAGE, ['effective-from-date-day', 'effective-from-date-month', 'effective-from-date-year']);
  }

  return {
    effectiveFromDate: parsedDate,
    errors: null,
  };
};
