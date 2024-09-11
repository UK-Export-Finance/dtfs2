import { contract } from '../../../e2e/pages';

/**
 * clickAddBondButton
 * Click the add bond button.
 */
const clickAddBondButton = () => {
  contract.addBondButton().click();
};

export default clickAddBondButton;
