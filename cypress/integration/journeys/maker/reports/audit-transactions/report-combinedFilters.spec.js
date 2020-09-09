const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );

// test data we want to set up + work with..
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');

context('The Transactions dashboard', () => {
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

  it('works with multiple filters', () => {
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    // select a stage
    auditTransactionsReport.filterByFacilityStage().select('unissued_conditional');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(27 items)');
    });

    // filter by ukef id
    auditTransactionsReport.filterByUKEFSupplyContractId().type('{selectall}{backspace}ukef:adealwithten');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(25 items)');
    });

    // filter by bank supply contract id
    auditTransactionsReport.filterByBankSupplyContractId().type('{selectall}{backspace}adealwithtenl');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(15 items)');
    });

    // -> unissued bonds + a search term that were created before the industrial revolution
    auditTransactionsReport.filterByEndDate.day().type('{selectall}{backspace}01');
    auditTransactionsReport.filterByEndDate.month().type('{selectall}{backspace}01');
    auditTransactionsReport.filterByEndDate.year().type('{selectall}{backspace}1895');
    auditTransactionsReport.applyFilters().click();
    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(0 items)');
    });

  });
});
