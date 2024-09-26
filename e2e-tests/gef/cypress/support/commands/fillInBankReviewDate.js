import { format } from 'date-fns';
import bankReviewDate from '../../e2e/pages/bank-review-date';
import { longYearFormat, shortDayFormat, shortMonthFormat } from '../../../../e2e-fixtures/dateConstants';

/**
 * Fill in the bank review date form
 * @param {Date} date
 */
export const fillInBankReviewDate = (date) => {
  cy.keyboardInput(bankReviewDate.bankReviewDateDay(), format(date, shortDayFormat));
  cy.keyboardInput(bankReviewDate.bankReviewDateMonth(), format(date, shortMonthFormat));
  cy.keyboardInput(bankReviewDate.bankReviewDateYear(), format(date, longYearFormat));
};
