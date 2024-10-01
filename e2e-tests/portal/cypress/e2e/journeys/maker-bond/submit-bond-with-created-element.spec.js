const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillBondForm = require('./fill-bond-forms');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Bond form - Submit bond with created element on page', () => {
  let dealId;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});

    cy.getDealIdFromUrl().then((id) => {
      dealId = id;
    });
  });

  it("should not insert created element's data into the bond", () => {
    // navigate to the about-buyer page
    cy.loginGoToDealPage(BANK1_MAKER1);

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

    cy.getDeal(dealId, BANK1_MAKER1).then((updatedDeal) => {
      cy.getFacility(dealId, updatedDeal.facilities[0], BANK1_MAKER1).then((bond) => {
        // checks bond does not contain inserted field
        expect(bond.intruder).to.be.an('undefined');
      });
    });
  });
});
