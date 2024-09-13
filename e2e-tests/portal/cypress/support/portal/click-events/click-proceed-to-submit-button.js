import { contract } from '../../../e2e/pages';

/**
 * clickProceedToSubmitButton
 * Click the proceed to submit button.
 */
const clickProceedToSubmitButton = () => {
  contract.proceedToSubmit().click();
};

export default clickProceedToSubmitButton;
