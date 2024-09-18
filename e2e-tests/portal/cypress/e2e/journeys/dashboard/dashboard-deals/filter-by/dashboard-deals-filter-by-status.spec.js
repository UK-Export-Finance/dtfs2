const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const CONTENT_STRINGS = require('../../../../../fixtures/content-strings');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by status', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Draft', () => {
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
      dashboardDeals.filters.panel.form.status.draft.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.draft.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().contains(expectedText);
    });

    it('renders only draft deals', () => {
      const ALL_DRAFT_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboardDeals.rows().should('have.length', ALL_DRAFT_DEALS.length);

      const firstDraftDeal = ALL_DRAFT_DEALS[0];

      dashboardDeals.row.status(firstDraftDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    });
  });

  describe('Ready for checker', () => {
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
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().contains(expectedText);
    });

    it('renders only Ready for Check deals', () => {
      const ALL_READY_FOR_CHECK_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
      dashboardDeals.rows().should('have.length', ALL_READY_FOR_CHECK_DEALS.length);

      const firstReadyToCheckDeal = ALL_READY_FOR_CHECK_DEALS[0];

      dashboardDeals.row.status(firstReadyToCheckDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
    });
  });

  describe('All statuses', () => {
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
      dashboardDeals.filters.panel.form.status.all.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.all.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusAll().should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusAll().contains(expectedText);
    });

    it('renders all deals regardless of status', () => {
      dashboardDeals.rows().should('have.length', ALL_DEALS.length);
    });
  });
});
