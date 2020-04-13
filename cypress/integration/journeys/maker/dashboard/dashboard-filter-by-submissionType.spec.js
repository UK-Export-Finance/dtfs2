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
  });

  before( async() => {
    // clean down anything our test-users have created
    await deleteAllDeals(maker1);
    // insert deals as each user
    dealsFromMaker1 = await createManyDeals(dealsFromMaker1, { ...maker1 });
  });

  it('submissionType=all -> all deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('all');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent(dealsFromMaker1.slice(0,20));
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboard.filterBySubmissionType().should('have.value', 'all')
  });

  it('submissionType=automaticInclusionNotice -> filtered', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('automaticInclusionNotice');
    dashboard.applyFilters().click();

    const automaticInclusionNotices = dealsFromMaker1.filter( deal=>deal.details.submissionType==='Automatic Inclusion Notice');

    dashboard.confirmDealsPresent(automaticInclusionNotices);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${automaticInclusionNotices.length} items)`);
    });

    dashboard.filterBySubmissionType().should('have.value', 'automaticInclusionNotice')
  });

  it('submissionType=manualInclusionApplication -> filtered', () => {
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

  it('submissionType=manualInclusionNotice -> filtered', () => {
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
