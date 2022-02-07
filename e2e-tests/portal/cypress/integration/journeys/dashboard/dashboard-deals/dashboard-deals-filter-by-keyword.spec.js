const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - filter by keyword', () => {
  const MOCK_KEYWORD = 'Special exporter';

  const ALL_DEALS = [];

  const BSS_DEAL_SPECIAL_EXPORTER = {
    ...BSS_DEAL_DRAFT,
    exporter: {
      companyName: MOCK_KEYWORD,
    },
  };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_SPECIAL_EXPORTER, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Keyword', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      // apply filter
      dashboardFilters.panel.form.keyword.input().type(MOCK_KEYWORD);
      dashboardFilters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders submitted keyword', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      dashboardFilters.panel.form.keyword.input().should('have.value', MOCK_KEYWORD);
    });

    it('renders the applied keyword in the `applied filters` section', () => {
      dashboardFilters.panel.selectedFilters.container().should('be.visible');
      dashboardFilters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = dashboardFilters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Keyword');

      const firstAppliedFilter = dashboardFilters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied keyword in the `main container selected filters` section', () => {
      dashboardFilters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      dashboardFilters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).contains(expectedText);
    });

    it(`renders only deals that have ${MOCK_KEYWORD} in a field`, () => {
      const ALL_KEYWORD_DEALS = ALL_DEALS.filter(({ exporter }) => exporter.companyName === MOCK_KEYWORD);
      dashboardDeals.rows().should('have.length', ALL_KEYWORD_DEALS.length);

      const firstDraftDeal = ALL_KEYWORD_DEALS[0];

      dashboardDeals.row.exporter(firstDraftDeal._id).should('have.text', MOCK_KEYWORD);
    });
  });
});
