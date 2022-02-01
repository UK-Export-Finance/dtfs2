const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');

const { dashboard, selectScheme } = require('../../../pages');

const BANK3_GEF_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK3_GEF_MAKER1'));
const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Create application as gef-only bank and other bank', () => {
  describe('Create application as gef-only bank', () => {
    before(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(BANK3_GEF_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('When clicking Create new button, it takes user straight to mandatory criteria page', () => {
      dashboard.createNewSubmission().click();
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });

    it('When clicking continue, it should lead to name your application', () => {
      dashboard.mandatoryCriteriaYes().click();
      dashboard.continueButton().click();
      cy.url().should('eq', relative('/gef/name-application'));
    });
  });

  describe('Create application as all other banks', () => {
    before(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('When clicking Create new button, it takes user to select scheme page', () => {
      dashboard.createNewSubmission().click();
      cy.url().should('eq', relative('/select-scheme'));
    });

    it('When clicking on gef, should then take you to mandatory criteria page', () => {
      selectScheme.gef().click();
      selectScheme.continue().click();
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });
  });
});
