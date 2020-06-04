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

  it('can be filtered by supplier name', () => {
    const testName = twentyOneDeals[0].submissionDetails['supplier-name'];

    cy.login({ ...maker1 });
    dashboard.visit();

    dashboard.showFilters().click();

    dashboard.filterBySupplierName().type(testName);
    dashboard.applyFilters().click();

    // get the test-data we are expecting to see
    const filteredDeals = deals.filter((deal) => deal.submissionDetails['supplier-name'] === testName);
    expect(filteredDeals.length).to.equal(1);

    // confirm the test-data
    dashboard.confirmDealsPresent(filteredDeals);

    // confirm the filter retains its state
    dashboard.filterBySupplierName().should('be.visible');
    dashboard.filterBySupplierName().should('have.value', testName);
  });
});
