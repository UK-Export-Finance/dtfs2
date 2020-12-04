const { dashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../../fixtures/deal-dashboard-data');

context('The deals dashboard', () => {
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
    cy.insertManyDeals(twentyOneDeals, MAKER_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by status', () => {
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    // check Show abandoned deals is off by default
    dashboard.filterByShowAbandonedDeals_no().should( (option) => expect(option).to.be.checked );

    // check we have the right number of results
    //  -our 21 test deals contain 2 with status==Abandoned.. so...
    dashboard.totalItems().should( (totalItems) => expect(totalItems).to.contain("(19 items)") )

    // check Show abandoned deals + apply filters
    dashboard.filterByShowAbandonedDeals_yes().click();
    dashboard.applyFilters().click();

    // check we have the right number of results
    dashboard.totalItems().should( (totalItems) => expect(totalItems).to.contain("(21 items)") )

    // check the checkbox is still checked
    dashboard.filterByShowAbandonedDeals_yes().should( (option) => expect(option).to.be.checked );
  });
});
