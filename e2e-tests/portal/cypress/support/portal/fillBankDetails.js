const { bankDetails } = require('../../e2e/pages');
const { bank } = require('../../fixtures/deal');
/**
 * Fills in the bank details form with predefined values and submits the form.
 *
 * This function performs the following actions:
 * - Inputs the bank deal ID as '123'.
 * - Inputs the bank deal name as 'BssDeal'.
 * - Clicks the submit button to submit the form.
 */
const fillBankDetails = () => {
  cy.keyboardInput(bankDetails.bankDealId(), bank.id);
  cy.keyboardInput(bankDetails.bankDealName(), bank.name);
  cy.clickSubmitButton();
};

export { fillBankDetails };
