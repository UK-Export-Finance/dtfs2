const pages = require('../../pages');
const relative = require('../../relativeURL');
const mockUsers = require('../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker')));

context('Dashboard Deals viewed by a user with role=checker', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  describe('when redirected from login page to dashboard page', () => {
    it('Dashboard defaults to showing status=readyForApproval', () => {
      cy.login(CHECKER_LOGIN);

      cy.url().should('eq', relative('/dashboard/0'));
    });
  });

  describe('when navigating back to dashboard page', () => {
    it('Dashboard defaults to showing status=readyForApproval', () => {
      cy.login(CHECKER_LOGIN);
      cy.url().should('eq', relative('/dashboard/0'));

      // go to another page
      pages.header.profile().click();
      cy.url().should('include', '/user');

      // navigate back to dashbaord page
      pages.header.dashboard().click();

      cy.url().should('eq', relative('/dashboard/0'));
    });
  });
});
