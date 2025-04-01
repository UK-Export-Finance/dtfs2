const { bondFinancialDetails } = require('../../e2e/pages');
/**
 * Fills in the bond financial details form with predefined values.
 *
 * This function performs the following actions:
 * - Enters '100000' into the facility value input field.
 * - Selects 'Yes' for the currency same as supply contract currency option.
 * - Enters '10' into the risk margin fee input field.
 * - Enters '80' into the covered percentage input field.
 * - Clicks the submit button to submit the form.
 */
const fillBondFinancialDetails = () => {
  cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
  bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
  cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
  cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
  cy.clickSubmitButton();
};

export { fillBondFinancialDetails };
