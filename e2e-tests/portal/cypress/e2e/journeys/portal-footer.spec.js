const page = require('../pages/footer');
const relative = require('../relativeURL');
const { login, dashboardDeals } = require('../pages');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('portal GovUK footer', () => {
  beforeEach(() => {
    login.visit();
  });

  describe('signed-out user footer', () => {
    it('should ensure the footer component exist', () => {
      page.footer().should('exist');
    });

    it('should displays the correct footer component with the crown logo', () => {
      page.crown().should('exist');
      page.navigation().should('exist');
      page.coa().should('exist');
      page.ogl().contains('All content is available under the Open Government Licence v3.0, except where otherwise stated');
    });

    it('should display all the footer navigation links', () => {
      page.contact().should('exist');
      page.feedback().should('exist');
      page.cookies().should('exist');
      page.accessibility().should('exist');
      page.vulnerability().should('exist');
    });
  });

  describe('signed-in maker user footer', () => {
    before(() => {
      cy.login(BANK1_MAKER1);

      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should ensure the footer component exist', () => {
      page.footer().should('exist');
    });

    it('should displays the correct footer component with the crown logo', () => {
      page.crown().should('exist');
      page.navigation().should('exist');
      page.coa().should('exist');
      page.ogl().contains('All content is available under the Open Government Licence v3.0, except where otherwise stated');
    });

    it('should display all the footer navigation links', () => {
      page.contact().should('exist');
      page.feedback().should('exist');
      page.cookies().should('exist');
      page.accessibility().should('exist');
      page.vulnerability().should('exist');
    });
  });
});
