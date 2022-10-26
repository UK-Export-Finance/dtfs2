const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');
const page = require('../../pages/header');

const {
  dashboard,
  dashboardDeals,
  dashboardFacilities,
  selectScheme,
} = require('../../pages');

const { BANK3_GEF_MAKER1, BANK1_MAKER1 } = MOCK_USERS;

context('Create application as gef-only bank and GEF-and-BSS bank', () => {
  describe('from deals dashboard page', () => {
    describe('Create application as gef-only bank', () => {
      beforeEach(() => {
        Cypress.Cookies.preserveOnce('connect.sid');
        Cypress.Cookies.preserveOnce('_csrf');
      });
      before(() => {
        cy.login(BANK3_GEF_MAKER1);
        dashboardDeals.visit();
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

    describe('Create application as GEF-and-BSS banks', () => {
      beforeEach(() => {
        Cypress.Cookies.preserveOnce('connect.sid');
        Cypress.Cookies.preserveOnce('_csrf');
      });
      before(() => {
        cy.login(BANK1_MAKER1);
        dashboardDeals.visit();
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

  describe('from facilities dashboard page', () => {
    describe('Create application as gef-only bank', () => {
      beforeEach(() => {
        Cypress.Cookies.preserveOnce('connect.sid');
        Cypress.Cookies.preserveOnce('_csrf');
      });
      before(() => {
        cy.login(BANK3_GEF_MAKER1);
        dashboardFacilities.visit();
        cy.url().should('eq', relative('/dashboard/facilities/0'));
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

    describe('Create application as GEF-and-BSS banks', () => {
      beforeEach(() => {
        Cypress.Cookies.preserveOnce('connect.sid');
        Cypress.Cookies.preserveOnce('_csrf');
      });
      before(() => {
        cy.login(BANK1_MAKER1);
        dashboardFacilities.visit();
        cy.url().should('eq', relative('/dashboard/facilities/0'));
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
});
