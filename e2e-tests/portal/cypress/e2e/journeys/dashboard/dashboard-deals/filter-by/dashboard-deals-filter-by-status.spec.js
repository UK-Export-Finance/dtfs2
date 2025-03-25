import { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';

const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const CONTENT_STRINGS = require('../../../../../fixtures/content-strings');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

const EXPECTED_DEALS_LENGTH_BY_STATUS = {
  DRAFT: 1,
  READY_FOR_APPROVAL: 1,
  ALL_STATUSES: 2,
};

context('Dashboard Deals filters - filter by status', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1);
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

    it('should submit the filter and redirect to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.status.draft.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.draft.checkbox().should('be.checked');
    });

    it('should render the applied filter in the `applied filters` section', () => {
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

    it('should render the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().contains(expectedText);
    });

    it('should render only draft deals', () => {
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH_BY_STATUS.DRAFT);

      dashboardDeals.rows().each((row) => {
        cy.wrap(row).contains(CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      });
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

    it('should submit the filter and redirect to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().should('be.checked');
    });

    it('should render the applied filter in the `applied filters` section', () => {
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

    it('should render the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().contains(expectedText);
    });

    it('should render only Ready for Check deals', () => {
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH_BY_STATUS.READY_FOR_APPROVAL);

      dashboardDeals.rows().each((row) => {
        cy.wrap(row).contains(CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
      });
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

    it('should submit the filter and redirect to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.status.all.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render checked checkbox', () => {
      dashboardDeals.filters.panel.form.status.all.checkbox().should('be.checked');
    });

    it('should render the applied filter in the `applied filters` section', () => {
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

    it('should render the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.statusAll().should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      dashboardDeals.filters.mainContainer.selectedFilters.statusAll().contains(expectedText);
    });

    it('should render all deals regardless of status', () => {
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH_BY_STATUS.ALL_STATUSES);
    });
  });
});
