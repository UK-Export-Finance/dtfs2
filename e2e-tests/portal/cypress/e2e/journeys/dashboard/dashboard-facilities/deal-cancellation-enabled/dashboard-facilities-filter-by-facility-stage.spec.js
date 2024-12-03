const { FACILITY_STATUS, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
  BSS_FACILITY_BOND_ISSUED_RISK_EXPIRED,
  BSS_FACILITY_BOND_UNISSUED_RISK_EXPIRED,
} = require('../../fixtures');
const {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
} = require('../_actions-and-assertions');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - filter by facility stage with deal cancellation enabled', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED, BSS_FACILITY_BOND_ISSUED_RISK_EXPIRED, BSS_FACILITY_BOND_UNISSUED_RISK_EXPIRED];

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

  describe(CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED, () => {
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

      shouldRenderAppliedFilterInPanelSelectedFilters("Bank's facility stage", CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED,
      );
    });

    it('renders only facilities that are Issued', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED,
      );

      const expectedFacilities = ALL_FACILITIES.filter(
        (facility) => facility.hasBeenIssued === true && facility.facilityStage !== FACILITY_STATUS.RISK_EXPIRED,
      );

      dashboardFacilities.rows().should('have.length', expectedFacilities.length);

      expectedFacilities.forEach((facility) => {
        dashboardFacilities.row.type(facility._id).should('be.visible');
      });
    });
  });

  describe(CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED, () => {
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

      shouldRenderAppliedFilterInPanelSelectedFilters("Bank's facility stage", CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      );
    });

    it('renders only facilities that are Unissued', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      );

      const expectedFacilities = ALL_FACILITIES.filter(
        (facility) => facility.hasBeenIssued === false && facility.facilityStage !== FACILITY_STATUS.RISK_EXPIRED,
      );

      dashboardFacilities.rows().should('have.length', expectedFacilities.length);

      expectedFacilities.forEach((facility) => {
        dashboardFacilities.row.type(facility._id).should('be.visible');
      });
    });
  });

  describe(FACILITY_STAGE.RISK_EXPIRED, () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.stage.riskExpired.checkbox());
    });

    it('renders checked checkbox', () => {
      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.stage.riskExpired.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInPanelSelectedFilters("Bank's facility stage", FACILITY_STATUS.RISK_EXPIRED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeriskExpired(),
        FACILITY_STATUS.RISK_EXPIRED,
      );
    });

    it('renders only facilities that are Risk expired', () => {
      filters.showHideButton().click();

      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeRiskExpired(),
        FACILITY_STATUS.RISK_EXPIRED,
      );

      const expectedFacilities = ALL_FACILITIES.filter((facility) => facility.facilityStage === FACILITY_STATUS.RISK_EXPIRED);

      dashboardFacilities.rows().should('have.length', expectedFacilities.length);

      expectedFacilities.forEach((facility) => {
        dashboardFacilities.row.type(facility._id).should('be.visible');
      });
    });
  });
});
