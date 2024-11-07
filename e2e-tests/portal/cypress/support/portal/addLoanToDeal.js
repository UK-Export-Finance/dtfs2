const fillLoanForm = require('../../e2e/journeys/maker-loan/fill-loan-forms');

module.exports = () => {
  cy.clickAddLoanButton();
  fillLoanForm.unconditionalWithCurrencyNotTheSameAsSupplyContractCurrency();
  fillLoanForm.datesRepayments.inAdvanceAnnually();
  cy.clickSubmitButton();
};
