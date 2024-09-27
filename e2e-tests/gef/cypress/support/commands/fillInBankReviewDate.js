import { format } from 'date-fns';
import bankReviewDate from '../../e2e/pages/bank-review-date';

/**
 * Fill in the bank review date form
 * @param {Date} date
 */
export const fillInBankReviewDate = (date) => {
  cy.keyboardInput(bankReviewDate.bankReviewDateDay(), format(date, 'd'));
  cy.keyboardInput(bankReviewDate.bankReviewDateMonth(), format(date, 'M'));
  cy.keyboardInput(bankReviewDate.bankReviewDateYear(), format(date, 'yyyy'));
};
