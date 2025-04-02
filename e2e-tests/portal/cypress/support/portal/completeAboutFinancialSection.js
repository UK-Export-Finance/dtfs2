const { contractAboutFinancial } = require('../../e2e/pages');
/**
 * Completes the 'About Financial' section of the contract.
 *
 * Enters the supply contract value and selects the contract currency.
 *
 * @description This function simulates user input to fill out the 'About Financial' section of the contract.
 *
 * The function will:
 * - Enter a supply contract value of £12,000.
 * - Select GBP (British Pound) as the contract currency.
 * - Click the 'Save and Go Back' button.
 */
const completeAboutFinancialSection = () => {
  cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
  contractAboutFinancial.supplyContractCurrency().select('GBP');
  contractAboutFinancial.saveAndGoBack().click();
};

export { completeAboutFinancialSection };
