import { contract } from '../../../e2e/pages';

/**
 * clickProceedToReviewButton
 * Click the proceed to review button.
 */
const clickProceedToReviewButton = () => {
  contract.proceedToReview().click();
};

export default clickProceedToReviewButton;
