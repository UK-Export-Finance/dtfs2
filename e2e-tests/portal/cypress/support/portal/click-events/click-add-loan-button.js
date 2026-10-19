import { contract } from '../../../e2e/pages';

/**
 * clickAddLoanButton
 * Click the add loan button.
 */
export const clickAddLoanButton = () => {
  contract.addLoanButton().click();
};
