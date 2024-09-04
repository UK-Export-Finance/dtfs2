import { format } from 'date-fns';
import bankReviewDate from '../../e2e/pages/bank-review-date';

/**
 * Fill in the bank review date form
 * @param {Date} date
 */
export const fillInBankReviewDate = (date) => {
  bankReviewDate.bankReviewDateDay().clear().type(format(date, 'd'));
  bankReviewDate.bankReviewDateMonth().clear().type(format(date, 'M'));
  bankReviewDate.bankReviewDateYear().clear().type(format(date, 'yyyy'));
};
