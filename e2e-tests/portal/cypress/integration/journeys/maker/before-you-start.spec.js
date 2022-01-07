const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Red Line eligibility checking', () => {
  describe('When the `Mandatory criteria` form is submitted without confirming an answer', () => {
    it('should display validation error', () => {
      cy.createBSSSubmission(MAKER_LOGIN);

      pages.beforeYouStart.submit().click();

      cy.url().should('eq', relative('/before-you-start'));
      cy.title().should('eq', `Mandatory criteria${pages.defaults.pageTitleAppend}`);

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    });
  });

  it('A deal that fails red-line checks is rejected and links back to home page', () => {
    cy.createBSSSubmission(MAKER_LOGIN);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/unable-to-proceed'));

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('the Unable To Proceed page links back to the home page', () => {
    cy.createBSSSubmission(MAKER_LOGIN);

    pages.beforeYouStart.false().click();
    pages.beforeYouStart.submit().click();

    pages.unableToProceed.goToHomepage().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A deal that passes red-line checks can progress to enter supply detaile', () => {
    cy.createBSSSubmission(MAKER_LOGIN);

    pages.beforeYouStart.true().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('eq', relative('/before-you-start/bank-deal'));
  });
});
