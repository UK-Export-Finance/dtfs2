const { reports } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');
// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

const { auditSupplyContracts } = reports;

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

context('Audit - Report', () => {
  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.insertManyDeals(transactionTestData.all, ADMIN_LOGIN);
  });

  it('can be filtered by UKEF supply contract id', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByUKEFSupplyContractId().type('{selectall}{backspace}');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    auditSupplyContracts.filterByUKEFSupplyContractId().type('{selectall}{backspace}ukef:adealwithten');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });
  });
});
