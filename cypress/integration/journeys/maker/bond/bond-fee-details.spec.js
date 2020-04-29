const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Bond Fee Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then( insertedDeal => deal=insertedDeal );
  });

  it('form submit should progress to the `Bond Preview` page and prepopulate submitted form fields when returning back to `Bond Fee Details` page', () => {
    cy.loginGoToDealPage(user, deal);

    pages.contract.addBondButton().click();
    partials.bondProgressNav.progressNavBondFeeDetails().click();
    cy.url().should('include', '/fee-details');

    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/preview');

    partials.bondProgressNav.progressNavBondFeeDetails().click();
    cy.url().should('include', '/fee-details');

    assertBondFormValues.feeDetails();
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Fee Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      partials.bondProgressNav.progressNavBondFeeDetails().click();
      cy.url().should('include', '/fee-details');

      fillBondForm.feeDetails();

      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFeeDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/fee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumber().click();
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        cy.url().should('include', '/fee-details');

        assertBondFormValues.feeDetails();
      });
    });
  });
});
