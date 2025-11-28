const accountSuspendedPage = require('../../../pages/login/account-suspended-page');
const relative = require('../../../relativeURL');

context('Portal temporarily suspended access code page', () => {
  beforeEach(() => {
    cy.saveSession();
  });

  describe('when visiting the temporarily suspended access code page', () => {
    beforeEach(() => {
      accountSuspendedPage.visit();
    });

    it('should display the correct URL', () => {
      cy.url().should('eq', relative('/login/temporarily-suspended-access-code'));
    });

    it('should render the page with status 200', () => {
      cy.request('/login/temporarily-suspended-access-code').its('status').should('eq', 200);
    });

    it('should display the page heading', () => {
      accountSuspendedPage.heading().should('exist');
      accountSuspendedPage.heading().should('be.visible');
    });

    it('should display the page body text', () => {
      accountSuspendedPage.bodyText().should('exist');
      accountSuspendedPage.bodyText().should('be.visible');
    });

    it('should display a contact link if present', () => {
      accountSuspendedPage.contactLink().should('exist');
    });
  });
});
