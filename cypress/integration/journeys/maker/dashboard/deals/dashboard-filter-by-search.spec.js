const { dashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../../fixtures/deal-dashboard-data');

const fuzzify = (originalText) => {
  // to lower case, to prove case insensitive searching
  // hack off the last character to prove we're doing 'like%' queries..
  return originalText.toLowerCase().slice(0,-1);
}
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

  it('can be filtered by supplier name', () => {
    const myExpectedDeal = deals[0];
    const supplierNameSearch = fuzzify(myExpectedDeal.submissionDetails['supplier-name']);
    const indemnifierNameSearch = fuzzify(myExpectedDeal.submissionDetails['indemnifier-name']);
    const buyerNameSearch = fuzzify(myExpectedDeal.submissionDetails['buyer-name']);
    const bankSupplyContractIDSearch = fuzzify(myExpectedDeal.details['bankSupplyContractID']);
    const ukefDealIdSearch = fuzzify(myExpectedDeal.details['ukefDealId']);
    const supplierCHSearch = fuzzify(myExpectedDeal.submissionDetails['supplier-companies-house-registration-number']);
    const indemnifierCHSearch = fuzzify(myExpectedDeal.submissionDetails['indemnifier-companies-house-registration-number']);

    cy.login(MAKER_LOGIN);
    dashboard.visit();

    // search by supplier name
    dashboard.showFilters().click();
    dashboard.filterSearch().clear().type(supplierNameSearch);
    dashboard.applyFilters().click();

    // confirm the test-data
    dashboard.confirmDealsPresent([myExpectedDeal]);

    // confirm the filter retains its state
    dashboard.filterSearch().should('be.visible');
    dashboard.filterSearch().should('have.value', supplierNameSearch);

    // search by indemnifier name
    dashboard.filterSearch().clear().type(indemnifierNameSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

    // search by buyer name
    dashboard.filterSearch().clear().type(buyerNameSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

    // search by bank contract id
    dashboard.filterSearch().clear().type(bankSupplyContractIDSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

    // search by ukef id
    dashboard.filterSearch().clear().type(ukefDealIdSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

    // search by companies house number
    dashboard.filterSearch().clear().type(supplierCHSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

    dashboard.filterSearch().clear().type(indemnifierCHSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([myExpectedDeal]);

  });
});
