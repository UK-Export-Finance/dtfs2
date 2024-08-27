const pages = require('../../e2e/pages');
const fillBondForm = require('../../e2e/journeys/maker-bond/fill-bond-forms');

module.exports = () => {
  pages.contract.addBondButton().click();

  fillBondForm.details.facilityStageIssued();
  cy.clickSubmitButton();

  fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
  cy.clickSubmitButton();

  fillBondForm.feeDetails();
  cy.clickSubmitButton();
};
