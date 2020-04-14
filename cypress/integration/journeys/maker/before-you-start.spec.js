const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');

context('Red Line eligibility checking', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  describe('When the `Mandatory criteria` form is submitted without confirming an answer', () => {
    it('should display validation error', () => {
      cy.createNewSubmission({ username: 'MAKER', password: 'MAKER' });

      pages.beforeYouStart.submit().click();

      cy.url().should('eq', relative('/before-you-start'));

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    });
  });

  it('A deal that fails red-line checks is rejected and links back to home page', () => {
    cy.createNewSubmission({username: 'MAKER', password: 'MAKER'});

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/unable-to-proceed'));

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('the Unable To Proceed page links back to the home page', () => {
    cy.createNewSubmission({username: 'MAKER', password: 'MAKER'});

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('A deal that passes red-line checks can progress to enter supply detaile', () => {
    cy.createNewSubmission({username: 'MAKER', password: 'MAKER'});

    pages.beforeYouStart.true().click();
    pages.beforeYouStart.submit().click();

    // cy.url().should('include', '/before-you-start/bank-deal');
    cy.url().should('eq', relative('/before-you-start/bank-deal'));
  });

})
