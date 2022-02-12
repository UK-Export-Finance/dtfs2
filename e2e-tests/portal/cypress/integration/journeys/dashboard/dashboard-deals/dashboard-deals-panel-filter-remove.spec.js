const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const { dashboardFilters: filters } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals - panel selected filters - remove a filter', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('applies and removes a filter', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check the filter is in the applied filters section
    const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();
    firstAppliedFilter.should('be.visible');

    // click remove button
    firstAppliedFilter.click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
    filters.panel.container().should('be.visible');

    // should have empty applied filters
    filters.panel.selectedFilters.container().should('not.exist');
    filters.panel.selectedFilters.list().should('not.exist');

    // checkbox should be NOT be checked
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);
  });
});
