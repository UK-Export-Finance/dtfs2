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

  it('can be filtered by transaction stage', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();

    //-----
    // status = all
    //-----
    transactionDashboard.showFilters().click();
    transactionDashboard.filterByTransactionStage().select('all');
    transactionDashboard.applyFilters().click();

    transactionDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    transactionDashboard.showFilters().click();
    transactionDashboard.filterByTransactionStage().should('have.value', 'all');

    // select the filter option
    transactionDashboard.filterByTransactionStage().select('unissued_conditional');
    transactionDashboard.applyFilters().click();

    // we should see at least one loan and at least one bond in the correct state, and none in an incorrect state..
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).not.to.contain("Issued")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).not.to.contain("Unconditional")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).to.contain("Unissued")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).to.contain("Conditional")});

    // confirm the filter retains its state
    transactionDashboard.filterByTransactionStage().should('be.visible');
    transactionDashboard.filterByTransactionStage().should('have.value', 'unissued_conditional');


    // select the filter option
    transactionDashboard.filterByTransactionStage().select('issued_unconditional');
    transactionDashboard.applyFilters().click();

    // we should see at least one loan and at least one bond in the correct state, and none in an incorrect state..
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).not.to.contain("Unissued")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).not.to.contain("Conditional")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).to.contain("Issued")});
    transactionDashboard.facilityStageResults().should( (stage) => { expect(stage).to.contain("Unconditional")});

    // confirm the filter retains its state
    transactionDashboard.filterByTransactionStage().should('be.visible');
    transactionDashboard.filterByTransactionStage().should('have.value', 'issued_unconditional');

  });
});
