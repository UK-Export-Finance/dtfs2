const { dashboard } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

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

  it('can be filtered by status', () => {
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    //-----
    // status = all
    //-----
    dashboard.showFilters().click();
    dashboard.filterByStatus().select('all');
    dashboard.applyFilters().click();
    // in dashbaord, these are ordered by last update, so appear reversed
    const firstTwentyDeals = deals.slice(1, 21).reverse();

    dashboard.confirmDealsPresent(firstTwentyDeals);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboard.showFilters().click();
    dashboard.filterByStatus().should('have.value', 'all');

    const testCases = [
      { code: 'draft', status: 'Draft' },
      { code: 'readyForApproval', status: "Ready for Checker's approval" },
      { code: 'inputRequired', status: "Further Maker's input required" },
      { code: 'abandoned', status: 'Abandoned Deal' },
      { code: 'submitted', status: 'Submitted' },
      { code: 'submissionAcknowledged', status: 'Acknowledged by UKEF' },
      { code: 'approved', status: 'Accepted by UKEF (without conditions)' },
      { code: 'approvedWithConditions', status: 'Accepted by UKEF (with conditions)' },
      { code: 'refused', status: 'Rejected by UKEF' },
    ];

    for (const testCase of testCases) {
      // select the filter option
      dashboard.filterByStatus().select(testCase.code);
      dashboard.applyFilters().click();

      // get the test-data we are expecting to see
      const filteredDeals = deals.filter((deal) => deal.details.status === testCase.status);
      expect(filteredDeals.length).to.be.greaterThan(0);

      // confirm the test-data
      dashboard.confirmDealsPresent(filteredDeals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal(`(${filteredDeals.length} items)`);
      });

      // confirm the filter retains its state
      dashboard.filterByStatus().should('be.visible');
      dashboard.filterByStatus().should('have.value', testCase.code);
    }
  });
});
