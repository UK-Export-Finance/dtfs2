const pages = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillBondForm = require('./fill-bond-forms');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Bond form - Submit bond with created element on page', () => {
  let deal;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it("should not insert created element's data into the bond", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    pages.contract.visit(deal);

    pages.contract.addBondButton().click();

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
    cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
      // get bond from deal facility id
      cy.getFacility(deal._id, updatedDeal.facilities[0], BANK1_MAKER1).then((bond) => {
        // checks bond does not contain inserted field
        expect(bond.intruder).to.be.an('undefined');
      });
    });
  });
});
