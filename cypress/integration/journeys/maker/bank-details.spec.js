const { bankDetails } = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');

context('Create deal', () => {
  const TOTAL_FORM_FIELDS = 2;
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      cy.passRedLine({ username: 'MAKER', password: 'MAKER' });
      bankDetails.bankDealId().clear();
      bankDetails.bankDealName().clear();

      bankDetails.submit().click();

      cy.url().should('eq', relative('/before-you-start/bank-deal'));

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  it('When the a user fills in the bank detais they progress to the deal page', () => {
    cy.passRedLine({ username: 'MAKER', password: 'MAKER' });

    // confirm that we're on '/before-you-start/bank-deal'
    cy.url().should('eq', relative('/before-you-start/bank-deal'));

    // complete 'before you start' form fields
    bankDetails.bankDealId().type('TEST1234');
    bankDetails.bankDealName().type('TESTING');
    bankDetails.submit().click();

    // confirm that we're on the newly created deal '/contract/XYZ'
    cy.url().should('include', '/contract/');
  });
})
