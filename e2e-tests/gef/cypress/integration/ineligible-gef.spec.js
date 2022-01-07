import relative from './relativeURL';
import ineligibleGef from './pages/ineligible-gef';
import CREDENTIALS from '../fixtures/credentials.json';

context('Ineligible GEF Page', () => {
  before(() => {
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/ineligible-gef'));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      ineligibleGef.mainHeading();
      ineligibleGef.content();
      ineligibleGef.backLink();
    });
  });

  describe('Clicking on Back Button', () => {
    it('redirects user to the applications and notices page', () => {
      ineligibleGef.backLink().click();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});
