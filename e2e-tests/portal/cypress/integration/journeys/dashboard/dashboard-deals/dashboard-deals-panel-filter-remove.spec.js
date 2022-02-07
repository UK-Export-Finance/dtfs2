const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
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
    dashboardFilters.showHideButton().click();

    // apply filter
    dashboardFilters.panel.form.submissionType.MIA.checkbox().click();
    dashboardFilters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();

    // check the filter is in the applied filters section
    const firstAppliedFilter = dashboardFilters.panel.selectedFilters.listItem().first();
    firstAppliedFilter.should('be.visible');

    // click remove button
    firstAppliedFilter.click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();
    dashboardFilters.panel.container().should('be.visible');

    // should have empty applied filters
    dashboardFilters.panel.selectedFilters.container().should('not.exist');
    dashboardFilters.panel.selectedFilters.list().should('not.exist');

    // checkbox should be NOT be checked
    dashboardFilters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);
  });
});
