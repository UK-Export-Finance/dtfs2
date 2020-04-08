const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals filter by status', () => {

  let dealsFromMaker1 = twentyOneDeals;

  beforeEach( () => {
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

  it('The Dashboard: status=all -> all deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('all');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent(dealsFromMaker1.slice(0,20));
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    dashboard.showFilters().click();
    dashboard.filterByStatus().should('have.value', 'all');
  });

  it('The Dashboard: status=draft -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('draft');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==='Draft');

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'draft');
  });

  it('The Dashboard: status=readyForApproval -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('readyForApproval');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Ready for Checker's approval");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'readyForApproval');
  });

  it('The Dashboard: status=inputRequired -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('inputRequired');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Further Maker's input required");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'inputRequired');
  });

  it('The Dashboard: status=abandoned -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('abandoned');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Abandoned Deal");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'abandoned');
  });

  it('The Dashboard: status=submitted -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('submitted');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Submitted");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'submitted');
  });

  it('The Dashboard: status=submissionAcknowledged -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('submissionAcknowledged');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Acknowledged by UKEF");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'submissionAcknowledged');
  });

  it('The Dashboard: status=approved -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('approved');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Accepted by UKEF (without conditions)");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'approved');
  });

  it('The Dashboard: status=approvedWithConditions -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('approvedWithConditions');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Accepted by UKEF (with conditions)");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'approvedWithConditions');
  });

  it('The Dashboard: status=refused -> filters deals displayed', () => {
    login({...maker1});
    dashboard.visit();

    dashboard.showFilters().click();
    dashboard.filterByStatus().select('refused');
    dashboard.applyFilters().click();

    const subset = dealsFromMaker1.filter( deal=>deal.details.status==="Rejected by UKEF");

    dashboard.confirmDealsPresent(subset);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${subset.length} items)`);
    });

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'refused');
  });
});
