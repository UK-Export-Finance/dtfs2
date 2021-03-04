import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_USERS from '../../../fixtures/users';

context('User can login', () => {
  describe('Login page', () => {
    it('should login and redirect to /deals when successful', () => {
      pages.landingPage.visit();
      pages.landingPage.email().type(MOCK_USERS[0].username);
      pages.landingPage.submitButton().click();
      cy.url().should('eq', relative('/deals'));
    });

    it('should not login and redirect to /deals when successful', () => {
      pages.landingPage.visit();
      pages.landingPage.email().type('wrongUser');
      pages.landingPage.submitButton().click();
      cy.url().should('eq', relative('/'));
    });
  });
});
