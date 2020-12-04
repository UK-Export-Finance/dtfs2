const { transactionDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

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
    transactionDashboard.visit();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    // -> bonds
    transactionDashboard.filterByTransactionType().select('bond');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(22 items)');
    });

    // -> bonds
    transactionDashboard.filterByTransactionType().select('bond');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(22 items)');
    });

    // -> unissued bonds
    transactionDashboard.filterByTransactionStage().select('unissued_conditional');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(15 items)');
    });

    // -> unissued bonds + a search term
    transactionDashboard.showFilters().click();
    transactionDashboard.search().type('{selectall}{backspace}adealwithTENb');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(10 items)');
    });

    // -> unissued bonds + a search term that were created before the industrial revolution
    transactionDashboard.filterByEndDate.day().type('{selectall}{backspace}01');
    transactionDashboard.filterByEndDate.month().type('{selectall}{backspace}01');
    transactionDashboard.filterByEndDate.year().type('{selectall}{backspace}1895');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(0 items)');
    });

  });
});
