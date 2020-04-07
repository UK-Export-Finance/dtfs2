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

  it('The Dashboard submissionType=manualInclusionNotice -> filtered', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('manualInclusionNotice');
    dashboard.applyFilters().click();

    const manualInclusionNotices = dealsFromMaker1.filter( deal=>deal.details.submissionType==='Manual Inclusion Notice');

    dashboard.confirmDealsPresent(manualInclusionNotices);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${manualInclusionNotices.length} items)`);
    });

    dashboard.filterBySubmissionType().should('have.value', 'manualInclusionNotice')
  });

});
