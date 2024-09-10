import { format } from 'date-fns';
import bankReviewDate from '../../e2e/pages/bank-review-date';
import { longYearFormat, shortDayFormat, shortMonthFormat } from '../../../../e2e-fixtures/dateConstants';

/**
 * Fill in the bank review date form
 * @param {Date} date
 */
export const fillInBankReviewDate = (date) => {
  bankReviewDate.bankReviewDateDay().clear().type(format(date, shortDayFormat));
  bankReviewDate.bankReviewDateMonth().clear().type(format(date, shortMonthFormat));
  bankReviewDate.bankReviewDateYear().clear().type(format(date, longYearFormat));
};
