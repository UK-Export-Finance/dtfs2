const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by submissionType/noticeType', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({ readyForCheck: true, dealType: 'BSS/EWCS', facilityStage: 'Issued' });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('MIA', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
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
      dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Notice Type');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
      dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().contains(expectedText);
    });

    it('renders only MIA deals', () => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      filters.showHideButton().click();
      dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      const expectedDeals = 1;

      dashboardDeals.rows().should('have.length', expectedDeals);
    });
  });
});
