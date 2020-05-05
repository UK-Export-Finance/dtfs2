const { dashboard } = require('../../../pages');

const maker1 = { username: 'MAKER', password: 'MAKER' };

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
    cy.deleteDeals(maker1);
    cy.insertManyDeals(twentyOneDeals, { ...maker1 })
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by supply contract id', () => {
    const testId = twentyOneDeals[1].details.bankSupplyContractID;

    cy.login({ ...maker1 });
    dashboard.visit();

    dashboard.showFilters().click();

    dashboard.filterBySupplyContractId().type(testId);
    dashboard.applyFilters().click();

    // get the test-data we are expecting to see
    const filteredDeals = deals.filter((deal) => deal.details.bankSupplyContractID === testId);
    expect(filteredDeals.length).to.equal(1);

    // confirm the test-data
    dashboard.confirmDealsPresent(filteredDeals);

    // confirm the filter retains its state
    dashboard.filterBySupplyContractId().should('be.visible');
    dashboard.filterBySupplyContractId().should('have.value', testId);
  });
});
