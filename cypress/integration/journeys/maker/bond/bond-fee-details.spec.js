const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Bond fee details', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user);
  });

  describe('When a user submits the `Bond Fee Details` form', () => {
    it('should progress to the `Bond Preview` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/fee-details');

        fillBondForm.feeDetails();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/preview');
      });
    });

    it('should prepopulate submitted form fields when returning back to Bond Fee Details page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        cy.url().should('include', '/fee-details');

        fillBondForm.feeDetails();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/preview');
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        cy.url().should('include', '/fee-details');

        pages.bondFeeDetails.feeTypeAtMaturityInput().should('be.checked');
        pages.bondFeeDetails.feeFrequencyAnnuallyInput().should('be.checked');
        pages.bondFeeDetails.dayCountBasis365Input().should('be.checked');
      });
    });
  });
});
