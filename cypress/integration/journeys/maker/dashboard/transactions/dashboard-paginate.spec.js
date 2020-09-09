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

  //TODO nothing here cares about the order of the results.. should it?
  it('has pagination', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    transactionDashboard.results().find('tr').should('have.length', 20);

    transactionDashboard.next().click();
    transactionDashboard.results().find('tr').should('have.length', 20);

    transactionDashboard.next().click();
    transactionDashboard.results().find('tr').should('have.length', 4);

    transactionDashboard.previous().click();
    transactionDashboard.results().find('tr').should('have.length', 20);

    transactionDashboard.last().click();
    transactionDashboard.results().find('tr').should('have.length', 4);

    transactionDashboard.first().click();
    transactionDashboard.results().find('tr').should('have.length', 20);

    // add a filter to prove things still work when filtered...
    transactionDashboard.filterByTransactionType().select('loan');
    transactionDashboard.applyFilters().click();
    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(22 items)');
    });
    transactionDashboard.results().find('tr').should('have.length', 20);
    transactionDashboard.last().click();
    transactionDashboard.results().find('tr').should('have.length', 2);

  });
});
