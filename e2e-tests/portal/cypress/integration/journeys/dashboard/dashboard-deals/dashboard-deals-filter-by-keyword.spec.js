const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

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
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

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
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      // apply filter
      dashboard.filterInputKeyword().type(MOCK_KEYWORD);
      dashboard.filtersApplyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders submitted keyword', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      dashboard.filterInputKeyword().should('have.value', MOCK_KEYWORD);
    });

    it('renders the applied keyword in the `applied filters` section', () => {
      dashboard.filtersAppliedContainer().should('be.visible');
      dashboard.filtersAppliedList().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Keyword');

      const firstAppliedFilter = dashboard.filtersAppliedListItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied keyword in the `main container selected filters` section', () => {
      dashboard.filtersSelectedMainContainerKeyword(MOCK_KEYWORD).should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      dashboard.filtersSelectedMainContainerKeyword(MOCK_KEYWORD).contains(expectedText);
    });

    it(`renders only deals that have ${MOCK_KEYWORD} in a field`, () => {
      const ALL_KEYWORD_DEALS = ALL_DEALS.filter(({ exporter }) => exporter.companyName === MOCK_KEYWORD);
      dashboard.rows().should('have.length', ALL_KEYWORD_DEALS.length);

      const firstDraftDeal = ALL_KEYWORD_DEALS[0];

      dashboard.row.exporter(firstDraftDeal._id).should('have.text', MOCK_KEYWORD);
    });
  });
});
