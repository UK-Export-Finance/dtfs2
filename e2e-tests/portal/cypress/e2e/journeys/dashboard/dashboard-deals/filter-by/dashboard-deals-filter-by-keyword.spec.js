const { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by keyword', () => {
  let bssDealId;
  const MOCK_KEYWORD = 'Special exporter';

  const EXPECTED_DEALS_LENGTH = {
    ALL_STATUSES: 2,
    FILTERED_BY_KEYWORD: 1,
  };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
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

    it('should submit the filter and redirect to the dashboard', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render submitted keyword', () => {
      filters.panel.form.keyword.input().should('have.value', MOCK_KEYWORD);
    });

    it('should render the applied keyword in the `applied filters` section', () => {
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

    it('should render the applied keyword in the `main container selected filters` section', () => {
      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).contains(expectedText);
    });

    it(`should render only deals that have the keyword ${MOCK_KEYWORD} in a field`, () => {
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH.FILTERED_BY_KEYWORD);

      cy.assertText(dashboardDeals.row.exporter(bssDealId), MOCK_KEYWORD);
    });
  });
});
