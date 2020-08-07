const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

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
      cy.createNewSubmission(MAKER_LOGIN);

      pages.beforeYouStart.submit().click();

      cy.url().should('eq', relative('/before-you-start'));
      cy.title().should('eq', `Mandatory criteria${pages.defaults.pageTitleAppend}`);

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    });
  });

  it('A deal that fails red-line checks is rejected and links back to home page', () => {
    cy.createNewSubmission(MAKER_LOGIN);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/unable-to-proceed'));

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('the Unable To Proceed page links back to the home page', () => {
    cy.createNewSubmission(MAKER_LOGIN);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/start-now'));
  });

  it('A deal that passes red-line checks can progress to enter supply detaile', () => {
    cy.createNewSubmission(MAKER_LOGIN);

    pages.beforeYouStart.true().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/before-you-start/bank-deal'));
  });
});
