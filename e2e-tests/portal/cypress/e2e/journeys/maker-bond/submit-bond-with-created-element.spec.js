const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillBondForm = require('./fill-bond-forms');
const relative = require('../../relativeURL');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Bond form - Submit bond with created element on page', () => {
  let bssDealId;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  it("should not insert created element's data into the bond", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    cy.visit(relative(`/contract/${bssDealId}`));

    cy.clickAddBondButton();

    fillBondForm.details.facilityStageIssued();
    // inserts text element into form
    cy.insertElement('bond-form');
    cy.clickSubmitButton();

    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    // inserts text element into form
    cy.insertElement('bond-financial-details-form');
    cy.clickSubmitButton();

    fillBondForm.feeDetails();
    // insert text element into form
    cy.insertElement('bond-fee-form');
    cy.clickSubmitButton();

    // gets deal
    cy.getDealIdFromUrl(4).then((id) => {
      cy.getDeal(id, BANK1_MAKER1).then((updatedDeal) => {
        cy.getFacility(id, updatedDeal.facilities[0], BANK1_MAKER1).then((bond) => {
          // checks bond does not have inserted field
          expect(bond.intruder).to.be.an('undefined');
        });
      });
    });
  });
});
