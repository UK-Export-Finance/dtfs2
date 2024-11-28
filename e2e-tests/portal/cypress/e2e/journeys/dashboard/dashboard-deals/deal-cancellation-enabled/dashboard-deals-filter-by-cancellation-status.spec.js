const { TFM_DEAL_STAGE } = require('@ukef/dtfs2-common');
const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { BSS_DEAL_READY_FOR_CHECK, GEF_DEAL_DRAFT, BSS_DEAL_CANCELLED } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;
const statusCheckboxSelectors = dashboardDeals.filters.panel.form.status;

context('Dashboard Deals Cancellation status filter - Deal cancellation feature flag enabled', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_CANCELLED, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Cancelled status filter', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardDeals.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('submits the filter and redirects to the dashboard', () => {
      // apply filter
      statusCheckboxSelectors.cancelled.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      statusCheckboxSelectors.cancelled.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      cy.assertText(firstAppliedFilterHeading, 'Status');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');
      const expectedText = `Remove this filter ${TFM_DEAL_STAGE.CANCELLED}`;
      cy.assertText(firstAppliedFilter, expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusCancelled().should('be.visible');

      const expectedText = `Remove this filter ${TFM_DEAL_STAGE.CANCELLED}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusCancelled().contains(expectedText);
    });

    it('renders only cancelled deals', () => {
      const expectedCancelledDeals = ALL_DEALS.filter(({ status }) => status === TFM_DEAL_STAGE.CANCELLED);

      dashboardDeals.rows().should('have.length', expectedCancelledDeals.length);

      const firstCancelledDeal = expectedCancelledDeals[0];

      cy.assertText(dashboardDeals.row.status(firstCancelledDeal._id), TFM_DEAL_STAGE.CANCELLED);
    });
  });
});
