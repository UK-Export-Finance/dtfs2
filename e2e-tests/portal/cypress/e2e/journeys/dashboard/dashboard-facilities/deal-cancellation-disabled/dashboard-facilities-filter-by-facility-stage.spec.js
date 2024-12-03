const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const {
  FACILITY: { FACILITY_STAGE },
} = require('../../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { BSS_DEAL_AIN, BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED } = require('../../fixtures');
const {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
  shouldRenderOnlyGivenTypes,
} = require('../_actions-and-assertions');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - filter by facility stage', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardFacilities.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  describe(FACILITY_STAGE.ISSUED, () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.stage.issued.checkbox());
    });

    it('renders checked checkbox', () => {
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.stage.issued.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters("Bank's facility stage", FACILITY_STAGE.ISSUED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued(), FACILITY_STAGE.ISSUED);
    });

    it('renders only facilities that are Issued', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued(), FACILITY_STAGE.ISSUED);

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'hasBeenIssued', true);
    });
  });

  describe(FACILITY_STAGE.UNISSUED, () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.stage.unissued.checkbox());
    });

    it('renders checked checkbox', () => {
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.stage.unissued.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters("Bank's facility stage", FACILITY_STAGE.UNISSUED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued(),
        FACILITY_STAGE.UNISSUED,
      );
    });

    it('renders only facilities that are Unissued', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued(),
        FACILITY_STAGE.UNISSUED,
      );

      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'hasBeenIssued', false);
    });
  });
});
