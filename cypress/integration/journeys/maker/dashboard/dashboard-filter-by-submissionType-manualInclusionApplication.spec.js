const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by submissionType', () => {

  let dealsFromMaker1 = twentyOneDeals;

  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clean down anything our test-users have created
    await deleteAllDeals(maker1);
    // insert deals as each user
    dealsFromMaker1 = await createManyDeals(dealsFromMaker1, { ...maker1 });
  });

  it('The Dashboard submissionType=manualInclusionApplication -> filtered', () => {
    // confirm that maker2 sees maker2's deals
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('manualInclusionApplication');
    dashboard.applyFilters().click();

    const manualInclusionApplications = dealsFromMaker1.filter( deal=>deal.details.submissionType==='Manual Inclusion Application');

    dashboard.confirmDealsPresent(manualInclusionApplications);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${manualInclusionApplications.length} items)`);
    });

    dashboard.filterBySubmissionType().should('have.value', 'manualInclusionApplication')
  });

});
