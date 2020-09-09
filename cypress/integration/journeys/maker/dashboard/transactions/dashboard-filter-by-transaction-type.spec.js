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

  it('can be filtered by transaction type', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    //-----
    // status = all
    //-----
    transactionDashboard.showFilters().click();
    transactionDashboard.filterByTransactionType().select('all');
    transactionDashboard.applyFilters().click();

    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    transactionDashboard.showFilters().click();
    transactionDashboard.filterByTransactionType().should('have.value', 'all');

    // select the filter option
    transactionDashboard.filterByTransactionType().select('bond');
    transactionDashboard.applyFilters().click();

    // we should see at least one bond and no loans
    transactionDashboard.type().should( (transactionType) => { expect(transactionType).to.contain("bond")});
    transactionDashboard.type().should( (transactionType) => { expect(transactionType).not.to.contain("loan")});

    // confirm the filter retains its state
    transactionDashboard.filterByTransactionType().should('be.visible');
    transactionDashboard.filterByTransactionType().should('have.value', 'bond');


    // select the filter option
    transactionDashboard.filterByTransactionType().select('loan');
    transactionDashboard.applyFilters().click();

    // we should see at least one loan and no bonds
    transactionDashboard.type().should( (transactionType) => { expect(transactionType).to.contain("loan")});
    transactionDashboard.type().should( (transactionType) => { expect(transactionType).not.to.contain("bond")});

    // confirm the filter retains its state
    transactionDashboard.filterByTransactionType().should('be.visible');
    transactionDashboard.filterByTransactionType().should('have.value', 'loan');

  });
});
