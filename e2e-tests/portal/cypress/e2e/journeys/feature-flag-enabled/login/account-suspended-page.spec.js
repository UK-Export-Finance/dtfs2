import accountSuspendedPage from '../../../pages/login/account-suspended-page';
import relative from '../../../relativeURL';

const url = relative('/login/temporarily-suspended-access-code');
const contactUsEmailAddress = Cypress.env('CONTACT_US_EMAIL_ADDRESS');

context('Portal temporarily suspended access code page', () => {
  beforeEach(() => {
    cy.saveSession();
  });

  describe('when visiting the temporarily suspended access code page', () => {
    beforeEach(() => {
      cy.visit(url);
    });

    it('should display the correct URL', () => {
      cy.url().should('eq', url);
    });

    it('should display the page heading', () => {
      cy.assertText(accountSuspendedPage.heading(), 'This account has been temporarily suspended');
    });

    it('should display the page body text', () => {
      cy.assertText(accountSuspendedPage.bodyText(), 'This can happen if there are too many failed attempts to login or sign in link requests.');
    });

    it('should display a contact link', () => {
      cy.assertText(accountSuspendedPage.contactLink(), contactUsEmailAddress);
      accountSuspendedPage.contactLink().should('have.attr', 'href', `mailto:${contactUsEmailAddress}`);
    });
  });

  // TODO: DTFS2-8217: add tests to verify access is blocked to protected routes
  // it('should block access to protected routes when account is suspended');
});
