const { dashboard } = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

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

  it('can be filtered by supply contract id', () => {
    const testId = twentyOneDeals[1].details.bankSupplyContractID;

    cy.login(MAKER_LOGIN);
    dashboard.visit();

    dashboard.showFilters().click();

    dashboard.filterSearch().type(testId);
    dashboard.applyFilters().click();

    // get the test-data we are expecting to see
    const filteredDeals = deals.filter((deal) => deal.details.bankSupplyContractID === testId);
    expect(filteredDeals.length).to.equal(1);

    // confirm the test-data
    dashboard.confirmDealsPresent(filteredDeals);

    // confirm the filter retains its state
    dashboard.filterSearch().should('be.visible');
    dashboard.filterSearch().should('have.value', testId);
  });
});
