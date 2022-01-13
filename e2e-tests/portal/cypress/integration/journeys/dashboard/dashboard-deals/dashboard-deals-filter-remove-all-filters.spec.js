const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - remove all filters', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
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
    dashboard.filters.showHideButton().click();

    // apply filter 1
    dashboard.filters.panel.form.status.draft.checkbox().click();

    // apply filter 2
    dashboard.filters.panel.form.submissionType.MIA.checkbox().click();

    // submit filters
    dashboard.filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();

    // check filters are applied
    dashboard.filters.panel.form.status.draft.checkbox().should('be.checked');
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');

    // click `clear all` button
    dashboard.filters.panel.selectedFilters.clearAllLink().should('be.visible');
    dashboard.filters.panel.selectedFilters.clearAllLink().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();
    dashboard.filters.panel.container().should('be.visible');

    // should have empty panel applied filters
    dashboard.filters.panel.selectedFilters.container().should('not.exist');
    dashboard.filters.panel.selectedFilters.list().should('not.exist');

    // should have empty main container applied filters
    dashboard.filters.mainContainer.selectedFilters.container().should('not.exist');

    // checkbox should be NOT be checked
    dashboard.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboard.rows().should('have.length', ALL_DEALS.length);
  });
});
