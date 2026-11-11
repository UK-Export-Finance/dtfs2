import { contract } from '../../../e2e/pages';

/**
 * clickProceedToReviewButton
 * Click the proceed to review button.
 */
export const clickProceedToReviewButton = () => {
  contract.proceedToReview().click();
};
