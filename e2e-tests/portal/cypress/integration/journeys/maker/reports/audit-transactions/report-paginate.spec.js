const { reports: { auditTransactionsReport } } = require('../../../../pages');
const relative = require('../../../../relativeURL');
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

context('Audit - Transactions Report', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN);
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
