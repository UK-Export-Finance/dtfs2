const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by dealType/product', () => {
  const ALL_DEALS = [
    {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      // other deal properties...
    },
    // other deals...
  ];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});

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

    it('submits the filter and redirects to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
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

      cy.assertText(dashboardDeals.rowIndex.product(), CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
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

    it('submits the filter and redirects to the dashboard', () => {
      // apply filter
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
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

      cy.assertText(dashboardDeals.rowIndex.product(), CONSTANTS.DEALS.DEAL_TYPE.GEF);
    });
  });
});
