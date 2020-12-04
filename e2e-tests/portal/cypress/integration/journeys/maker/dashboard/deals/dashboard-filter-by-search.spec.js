const { dashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
let deal = require('../../../../../fixtures/aDealForTestingFreeTextSearch');

const fuzzify = (originalText) => {
  // to lower case, to prove case insensitive searching
  // hack off the last character to prove we're doing 'like%' queries..
  return originalText.toLowerCase().slice(0,-1);
}
context('The deals dashboard', () => {

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(deal, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('can be filtered by supplier name', () => {
    const supplierNameSearch = fuzzify(deal.submissionDetails['supplier-name']);
    const indemnifierNameSearch = fuzzify(deal.submissionDetails['indemnifier-name']);
    const buyerNameSearch = fuzzify(deal.submissionDetails['buyer-name']);
    const bankSupplyContractIDSearch = fuzzify(deal.details['bankSupplyContractID']);
    const ukefDealIdSearch = fuzzify(deal.details['ukefDealId']);
    const supplierCHSearch = fuzzify(deal.submissionDetails['supplier-companies-house-registration-number']);
    const indemnifierCHSearch = fuzzify(deal.submissionDetails['indemnifier-companies-house-registration-number']);

    cy.login(MAKER_LOGIN);
    dashboard.visit();

    // search by supplier name
    dashboard.showFilters().click();
    dashboard.filterSearch().clear().type(supplierNameSearch);
    dashboard.applyFilters().click();

    // confirm the test-data
    dashboard.confirmDealsPresent([deal]);

    // confirm the filter retains its state
    dashboard.filterSearch().should('be.visible');
    dashboard.filterSearch().should('have.value', supplierNameSearch);

    // search by indemnifier name
    dashboard.filterSearch().clear().type(indemnifierNameSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

    // search by buyer name
    dashboard.filterSearch().clear().type(buyerNameSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

    // search by bank contract id
    dashboard.filterSearch().clear().type(bankSupplyContractIDSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

    // search by ukef id
    dashboard.filterSearch().clear().type(ukefDealIdSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

    // search by companies house number
    dashboard.filterSearch().clear().type(supplierCHSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

    dashboard.filterSearch().clear().type(indemnifierCHSearch);
    dashboard.applyFilters().click();
    dashboard.confirmDealsPresent([deal]);

  });
});
