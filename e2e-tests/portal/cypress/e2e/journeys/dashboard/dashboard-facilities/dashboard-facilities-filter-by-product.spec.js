const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_MIA,
  BSS_FACILITY_BOND,
  BSS_FACILITY_LOAN,
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
} = require('../fixtures');
const {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
  shouldRenderOnlyGivenTypes,
} = require('./_actions-and-assertions');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - filter by product/facility type', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [
        BSS_FACILITY_BOND,
        BSS_FACILITY_LOAN,
      ];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      const { _id: dealId } = deal;

      const facilities = [
        { ...GEF_FACILITY_CASH, dealId },
        { ...GEF_FACILITY_CONTINGENT, dealId },
      ];

      cy.insertManyGefFacilities(facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility.details);
        });
      });
    });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardFacilities.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  describe('Cash', () => {
    before(() => {
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.cash.checkbox());
    });

    it('renders checked checkbox', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.cash.checkbox());
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.type.cash.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.cash.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters('Product', CONSTANTS.FACILITY.FACILITY_TYPE.CASH);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.cash.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeCash(),
        CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
      );
    });

    it('renders only Cash facilities', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.cash.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeCash(),
        CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
      );

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'type', CONSTANTS.FACILITY.FACILITY_TYPE.CASH);
    });
  });

  describe('Contingent', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('submits the filter and redirects to the dashboard', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.contingent.checkbox());
    });

    it('renders checked checkbox', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.contingent.checkbox());
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.type.contingent.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.contingent.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters('Product', CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.contingent.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeContingent(),
        CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT,
      );
    });

    it('renders only Contingent facilities', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.contingent.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeContingent(),
        CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT,
      );

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'type', CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT);
    });
  });

  describe('Bond', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('submits the filter and redirects to the dashboard', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.bond.checkbox());
    });

    it('renders checked checkbox', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.bond.checkbox());
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.type.bond.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.bond.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters('Product', CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.bond.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeBond(),
        CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
      );
    });

    it('renders only Bond facilities', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.bond.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeBond(),
        CONSTANTS.FACILITY.FACILITY_TYPE.BOND,
      );

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'type', CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
    });
  });

  describe('Loan', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('submits the filter and redirects to the dashboard', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.loan.checkbox());
    });

    it('renders checked checkbox', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.loan.checkbox());
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.type.loan.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.loan.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters('Product', CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.loan.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeLoan(),
        CONSTANTS.FACILITY.FACILITY_TYPE.LOAN,
      );
    });

    it('renders only Bond facilities', () => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.type.loan.checkbox());

      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeLoan(),
        CONSTANTS.FACILITY.FACILITY_TYPE.LOAN,
      );

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'type', CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);
    });
  });
});
