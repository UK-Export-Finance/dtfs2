import { contract } from '../../../e2e/pages';

/**
 * clickProceedToSubmitButton
 * Click the proceed to submit button.
 */
export const clickProceedToSubmitButton = () => {
  contract.proceedToSubmit().click();
};
