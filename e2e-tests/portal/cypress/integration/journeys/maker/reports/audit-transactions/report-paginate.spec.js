const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Transactions Report', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('has pagination', () => {
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();

    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    auditTransactionsReport.results().find('tr').should('have.length', 20);

    auditTransactionsReport.next().click();
    auditTransactionsReport.results().find('tr').should('have.length', 20);

    auditTransactionsReport.next().click();
    auditTransactionsReport.results().find('tr').should('have.length', 4);

    auditTransactionsReport.previous().click();
    auditTransactionsReport.results().find('tr').should('have.length', 20);

    auditTransactionsReport.last().click();
    auditTransactionsReport.results().find('tr').should('have.length', 4);

    auditTransactionsReport.first().click();
    auditTransactionsReport.results().find('tr').should('have.length', 20);

    // add a filter to prove things still work when filtered...
    auditTransactionsReport.filterByFacilityStage().select('unissued_conditional');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(27 items)');
    });
    auditTransactionsReport.results().find('tr').should('have.length', 20);
    auditTransactionsReport.last().click();
    auditTransactionsReport.results().find('tr').should('have.length', 7);
  });

  describe('when applying a filter on a results page that is not the first page', () => {
    it('should redirect to the first page', () => {
      cy.login(MAKER_LOGIN);
      auditTransactionsReport.visit();

      cy.url().should('eq', relative('/reports/audit-transactions/0'));

      auditTransactionsReport.next().click();
      cy.url().should('eq', relative('/reports/audit-transactions/1'));

      auditTransactionsReport.filterByFacilityStage().select('unissued_conditional');
      auditTransactionsReport.applyFilters().click();

      cy.url().should('eq', relative('/reports/audit-transactions/0'));

      auditTransactionsReport.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal('(27 items)');
      });
    });
  });
});
