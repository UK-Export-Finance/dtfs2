const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardDeals } = require('../../../pages');
const { dashboardFilters: filters } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - filter by dealType/product', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('BSS', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      // apply filter
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Product');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders only BSS deals', () => {
      const ALL_BSS_DEALS = ALL_DEALS.filter(({ dealType }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
      dashboardDeals.rows().should('have.length', ALL_BSS_DEALS.length);

      const firstBssDeal = ALL_BSS_DEALS[0];

      dashboardDeals.row.product(firstBssDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
    });
  });

  describe('GEF', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      // apply filter
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      dashboardDeals.filters.panel.form.dealType.gef.checkbox().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.panel.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Product');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.productGEF().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`;
      dashboardDeals.filters.mainContainer.selectedFilters.productGEF().contains(expectedText);
    });

    it('renders only GEF deals', () => {
      const ALL_GEF_DEALS = ALL_DEALS.filter(({ dealType }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF);
      dashboardDeals.rows().should('have.length', ALL_GEF_DEALS.length);

      const firstGefDeal = ALL_GEF_DEALS[0];

      dashboardDeals.row.product(firstGefDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_TYPE.GEF);
    });
  });
});
