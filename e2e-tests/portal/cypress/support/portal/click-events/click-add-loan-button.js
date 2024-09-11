import { contract } from '../../../e2e/pages';

/**
 * clickAddLoanButton
 * Click the add loan button.
 */
const clickAddLoanButton = () => {
  contract.addLoanButton().click();
};

export default clickAddLoanButton;
