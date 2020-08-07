const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by submissionType', () => {
  let deals;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(twentyOneDeals, MAKER_LOGIN)
      .then( insertedDeals => deals=insertedDeals );
  });

  it('submissionType=all -> all deals displayed', () => {
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    dashboard.filterBySubmissionType().select('all');
    dashboard.applyFilters().click();

    // in dashbaord, these are ordered by last update, so appear reversed
    const firstTwentyDeals = deals.slice(1,21).reverse();

    dashboard.confirmDealsPresent(firstTwentyDeals);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboard.filterBySubmissionType().should('have.value', 'all')

    const testCases = [
      { code: 'automaticInclusionNotice', submissionType: "Automatic Inclusion Notice"},
      { code: 'manualInclusionApplication', submissionType: "Manual Inclusion Application"},
      { code: 'manualInclusionNotice', submissionType: "Manual Inclusion Notice"},
    ]

    for (const testCase of testCases) {
      // select the filter option
      dashboard.filterBySubmissionType().select( testCase.code );
      dashboard.applyFilters().click();

      // get the test-data we are expecting to see
      const filteredDeals = deals.filter( deal => deal.details.submissionType === testCase.submissionType);
      expect( filteredDeals.length ).to.be.greaterThan(0);

      // confirm the test-data
      dashboard.confirmDealsPresent(filteredDeals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal(`(${filteredDeals.length} items)`);
      });

      // confirm the filter retains its state
      dashboard.filterBySubmissionType().should('be.visible');
      dashboard.filterBySubmissionType().should('have.value', testCase.code);

    }

  });

});
