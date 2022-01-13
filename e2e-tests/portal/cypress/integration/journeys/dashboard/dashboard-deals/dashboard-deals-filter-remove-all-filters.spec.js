const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - remove all filters', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_MIA_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_MIA_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('removes all applied filters by clicking `clear filters` button', () => {
    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // apply filter 1
    dashboard.filterCheckboxStatusDraft().click();

    // apply filter 2
    dashboard.filterCheckboxSubmissionTypeMIA().click();

    // submit filters
    dashboard.filtersApplyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // check filters are applied
    dashboard.filterCheckboxStatusDraft().should('be.checked');
    dashboard.filterCheckboxSubmissionTypeMIA().should('be.checked');

    // click `clear all` button
    dashboard.filtersClearAllLink().should('be.visible');
    dashboard.filtersClearAllLink().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();
    dashboard.filtersContainer().should('be.visible');

    // should have empty applied filters
    dashboard.filtersAppliedContainer().should('not.exist');
    dashboard.filtersAppliedList().should('not.exist');

    // checkbox should be NOT be checked
    dashboard.filterCheckboxStatusDraft().should('not.be.checked');
    dashboard.filterCheckboxSubmissionTypeMIA().should('not.be.checked');

    // should render all deals
    dashboard.rows().should('have.length', ALL_DEALS.length);
  });
});
