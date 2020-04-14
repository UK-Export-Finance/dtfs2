const {createADeal, login} = require('../../../missions');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by submissionType', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.deleteAllDeals(maker1);
    cy.createManyDeals(twentyOneDeals, { ...maker1 });
  });

  it('submissionType=all -> all deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('all');
    dashboard.applyFilters().click();

    cy.uncacheDeals().then( (deals) => {
      dashboard.confirmDealsPresent(deals.slice(0,20));
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal('(21 items)');
      });

      dashboard.filterBySubmissionType().should('have.value', 'all')
    });
  });

  it('submissionType=automaticInclusionNotice -> filtered', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('automaticInclusionNotice');
    dashboard.applyFilters().click();

    cy.dealsBySubmissionType('Automatic Inclusion Notice').then( (deals) => {
      dashboard.confirmDealsPresent(deals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal(`(${deals.length} items)`);
      });

      dashboard.filterBySubmissionType().should('have.value', 'automaticInclusionNotice')
    });

  });

  it('submissionType=manualInclusionApplication -> filtered', () => {
    // confirm that maker2 sees maker2's deals
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('manualInclusionApplication');
    dashboard.applyFilters().click();

    cy.dealsBySubmissionType('Manual Inclusion Application').then( (deals) => {
      dashboard.confirmDealsPresent(deals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal(`(${deals.length} items)`);
      });

      dashboard.filterBySubmissionType().should('have.value', 'manualInclusionApplication')
    });

  });

  it('submissionType=manualInclusionNotice -> filtered', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.filterBySubmissionType().select('manualInclusionNotice');
    dashboard.applyFilters().click();

    cy.dealsBySubmissionType('Manual Inclusion Notice').then( (deals) => {
      dashboard.confirmDealsPresent(deals);
      dashboard.totalItems().invoke('text').then((text) => {
        expect(text.trim()).equal(`(${deals.length} items)`);
      });

      dashboard.filterBySubmissionType().should('have.value', 'manualInclusionNotice')
    });

  });

});
