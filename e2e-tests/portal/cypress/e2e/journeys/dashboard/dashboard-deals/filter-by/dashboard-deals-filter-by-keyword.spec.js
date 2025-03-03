const { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');

const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by keyword', () => {
  const MOCK_KEYWORD = 'Special exporter';

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED, exporterCompanyName: MOCK_KEYWORD });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardDeals.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  describe('Keyword', () => {
    before(() => {
      cy.login(BANK1_MAKER1);

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders submitted keyword', () => {
      filters.panel.form.keyword.input().should('have.value', MOCK_KEYWORD);
    });

    it('renders the applied keyword in the `applied filters` section', () => {
      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Keyword');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied keyword in the `main container selected filters` section', () => {
      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).contains(expectedText);
    });

    it(`renders only deals that have ${MOCK_KEYWORD} in a field`, () => {
      // Clear existing filters
      filters.panel.selectedFilters.clearAllLink().click();
      // Check the number of rows before applying any filter
      dashboardDeals.rows().should('have.length', 2);
      filters.showHideButton().click();
      const expectedLength = 1; // only 1x BSS/EWCS deal has MOCK_KEYWORD.
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      dashboardDeals.rows().should('have.length', expectedLength);

      cy.assertText(dashboardDeals.rowByIndex(0).exporter(), MOCK_KEYWORD);
    });
  });
});
