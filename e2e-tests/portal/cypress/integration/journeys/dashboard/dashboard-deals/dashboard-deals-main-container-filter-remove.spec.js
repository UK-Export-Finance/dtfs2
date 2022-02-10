const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals - main container selected filters - remove a filter', () => {
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
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardFilters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filter is in the applied filters section
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    // click remove button
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // should have empty applied filter
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('not.exist');

    // checkbox should be NOT be checked
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);
  });

  it('retains other filters when one is removed', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();

    // apply filters
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardFilters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // remove one of the filters
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().click();

    // should have removed the filter
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('not.exist');

    // should NOT have removed the other filter
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('exist');

    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();

    // check checkboxes
    dashboardDeals.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
  });
});
