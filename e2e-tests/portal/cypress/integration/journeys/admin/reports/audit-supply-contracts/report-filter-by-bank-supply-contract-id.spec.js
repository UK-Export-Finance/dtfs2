const { reports, defaults } = require('../../../../pages');

const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Report', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.insertManyDeals(transactionTestData.all, ADMIN_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by bank supply contract id', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByBankSupplyContractId().type('{selectall}{backspace}');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    auditSupplyContracts.filterByBankSupplyContractId().type('{selectall}{backspace}adealwithone');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });
  });
});
