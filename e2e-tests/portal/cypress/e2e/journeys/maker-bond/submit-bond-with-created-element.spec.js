const pages = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillBondForm = require('./fill-bond-forms');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Bond form - Submit bond with created element on page', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});
  });

  it("should not insert created element's data into the bond", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page
    cy.loginGoToDealPage(BANK1_MAKER1);

    fillBondForm.details.facilityStageIssued();
    // inserts text element into form
    cy.insertElement('bond-form');
    pages.bondDetails.submit().click();

    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    // inserts text element into form
    cy.insertElement('bond-financial-details-form');
    pages.bondFinancialDetails.submit().click();

    fillBondForm.feeDetails();
    // insert text element into form
    cy.insertElement('bond-fee-form');
    pages.bondFeeDetails.submit().click();

    // TODO: need to
    // 1) create a new command to get the deal ID from the URL
    //   - search for this, can move this into a command: // gets url and gets dealId from url
    // 2) consume the new command here.

    // cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
    //   // get bond from deal facility id
    //   cy.getFacility(deal._id, updatedDeal.facilities[0], BANK1_MAKER1).then((bond) => {
    //     // checks bond does not contain inserted field
    //     expect(bond.intruder).to.be.an('undefined');
    //   });
    // });
  });
});
