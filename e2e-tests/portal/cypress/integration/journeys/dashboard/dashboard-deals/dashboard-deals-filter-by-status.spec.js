const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const CONTENT_STRINGS = require('../../../../fixtures/content-strings');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_READY_FOR_CHECK,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Dashboard Deals filters - filter by status', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Draft', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      // apply filter
      dashboard.filters.panel.form.status.draft.checkbox().click();
      dashboard.filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      dashboard.filters.panel.form.status.draft.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filters.panel.selectedFilters.container().should('be.visible');
      dashboard.filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboard.filters.mainContainer.selectedFilters.statusDraft().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      dashboard.filters.mainContainer.selectedFilters.statusDraft().contains(expectedText);
    });

    it('renders only draft deals', () => {
      const ALL_DRAFT_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboard.rows().should('have.length', ALL_DRAFT_DEALS.length);

      const firstDraftDeal = ALL_DRAFT_DEALS[0];

      dashboard.row.status(firstDraftDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    });
  });

  describe('Ready for checker', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      // apply filter
      dashboard.filters.panel.form.status.readyForChecker.checkbox().click();
      dashboard.filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      dashboard.filters.panel.form.status.readyForChecker.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filters.panel.selectedFilters.container().should('be.visible');
      dashboard.filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboard.filters.mainContainer.selectedFilters.statusReadyForChecker().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
      dashboard.filters.mainContainer.selectedFilters.statusReadyForChecker().contains(expectedText);
    });

    it('renders only Ready for Check deals', () => {
      const ALL_READY_FOR_CHECK_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
      dashboard.rows().should('have.length', ALL_READY_FOR_CHECK_DEALS.length);

      const firstReadyToCheckDeal = ALL_READY_FOR_CHECK_DEALS[0];

      dashboard.row.status(firstReadyToCheckDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
    });
  });

  describe('All statuses', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      // apply filter
      dashboard.filters.panel.form.status.all.checkbox().click();
      dashboard.filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filters.showHideButton().click();

      dashboard.filters.panel.form.status.all.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filters.panel.selectedFilters.container().should('be.visible');
      dashboard.filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboard.filters.mainContainer.selectedFilters.statusAll().should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      dashboard.filters.mainContainer.selectedFilters.statusAll().contains(expectedText);
    });

    it('renders all deals regardless of status', () => {
      dashboard.rows().should('have.length', ALL_DEALS.length);
    });
  });
});
