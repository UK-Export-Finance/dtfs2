import { contract } from '../../../e2e/pages';

/**
 * clickAddBondButton
 * Click the add bond button.
 */
export const clickAddBondButton = () => {
  contract.addBondButton().click();
};
