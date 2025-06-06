const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { header, dashboardDeals } = require('../../../../pages');
const { dashboardSubNavigation, dashboardFilters } = require('../../../../partials');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - reset after applying and navigating away', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('resets filters after navigating away from the dashboard', () => {
    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();

    // apply filter 1
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();

    // apply filter 2
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();

    // submit filters
    dashboardFilters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filters are applied
    dashboardFilters.showHideButton().click();

    dashboardDeals.filters.panel.form.status.draft.checkbox().should('be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');

    // navigate somewhere else
    dashboardSubNavigation.facilities().click();
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // go back to dashboard
    header.dashboard().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // previously applied filters should not be applied
    dashboardDeals.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');
  });
});
