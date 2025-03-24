const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by dealType/product', () => {
  let bssDealId;
  const ALL_DEALS = [];

  const EXPECTED_DEALS_LENGTH = {
    BSS: 1,
    GEF: 1,
  };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
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

    beforeEach(() => {
      cy.saveSession();
      dashboardDeals.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('should submit the filter and redirect to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render checked checkbox', () => {
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().should('be.checked');
    });

    it('should render the applied filter in the `applied filters` section', () => {
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

    it('should render only BSS deals', () => {
      filters.showHideButton().click();
      // Check the length of rows after the filter is applied
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH.BSS);
      // Check the type of the deal is BSS after the filter is applied
      dashboardDeals.row.product(bssDealId).should('have.text', CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
    });
  });

  describe('GEF', () => {
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
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should render checked checkbox', () => {
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().should('be.checked');
    });

    it('should render the applied filter in the `applied filters` section', () => {
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

    it('should render the applied filter in the `main container selected filters` section', () => {
      dashboardDeals.filters.mainContainer.selectedFilters.productGEF().should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`;
      dashboardDeals.filters.mainContainer.selectedFilters.productGEF().contains(expectedText);
    });

    it('should render only GEF deals', () => {
      // Check the length of rows after the filter is applied
      dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH.GEF);
      // Check the type of the deal is GEF after the filter is applied
      dashboardDeals.row.product(ALL_DEALS[0]._id).should('have.text', CONSTANTS.DEALS.DEAL_TYPE.GEF);
    });
  });
});
