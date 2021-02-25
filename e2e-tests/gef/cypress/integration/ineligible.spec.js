/* eslint-disable no-undef */
import relative from './relativeURL';
import ineligible from './pages/ineligible';

context('Ineligible Page', () => {
  before(() => {
    // cy.clearDatabase();
    cy.fixture('login')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/ineligible'));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      ineligible.mainHeading();
      ineligible.content();
      ineligible.backButton();
    });
  });

  describe('Clicking on Back Button', () => {
    it('redirects user to ** page', () => {
      ineligible.backButton().click();
      cy.url().should('eq', relative('/gef/ineligible'));
    });
  });
});
