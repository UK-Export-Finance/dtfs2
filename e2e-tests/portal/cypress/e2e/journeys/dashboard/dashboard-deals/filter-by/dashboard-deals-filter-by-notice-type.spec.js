const { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by submissionType/noticeType', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.MIA, facilityStage: FACILITY_STAGE.ISSUED });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1);
  });

  describe('MIA', () => {
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
      dashboardDeals.rows().should('have.length', 1); // Expecting only one MIA deal

      dashboardDeals.rows().each((row) => {
        cy.wrap(row).contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      });
    });
  });
});
