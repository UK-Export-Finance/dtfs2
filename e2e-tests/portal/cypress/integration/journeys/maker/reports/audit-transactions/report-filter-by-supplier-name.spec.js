const { reports: { auditTransactionsReport } } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Transactions Report', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN);
  });

  it('can be filtered by supplier-name', () => {
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();

    auditTransactionsReport.filterBySupplierName().type('{selectall}{backspace}');
    auditTransactionsReport.applyFilters().click();

    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    auditTransactionsReport.filterBySupplierName().type('{selectall}{backspace}the seriously');
    auditTransactionsReport.applyFilters().click();

    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });
  });
});
