const fillBondForm = require('../../e2e/journeys/maker-bond/fill-bond-forms');

module.exports = () => {
  cy.clickAddBondButton();

  fillBondForm.details.facilityStageIssued();
  cy.clickSubmitButton();

  fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
  cy.clickSubmitButton();

  fillBondForm.feeDetails();
  cy.clickSubmitButton();
};
