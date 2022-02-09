const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
} = require('../fixtures');
const {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
  shouldRenderOnlyGivenTypes,
} = require('./_actions-and-assertions');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Facilities filters - filter by facility stage/hasBeenIssued', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [
        BSS_FACILITY_BOND_ISSUED,
        BSS_FACILITY_BOND_UNISSUED,
      ];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });
  });

  describe('Issued', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox());
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      shouldRenderAppliedFilterInPanelSelectedFilters('Bank\'s facility stage', CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED,
      );
    });

    it('renders only facilities that are Issued', () => {
      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'hasBeenIssued', true);
    });
  });

  describe('Unissued', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox());
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      shouldRenderAppliedFilterInPanelSelectedFilters(
        'Bank\'s facility stage',
        CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      );
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued(),
        CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      );
    });

    it('renders only facilities that are Unissued', () => {
      shouldRenderOnlyGivenTypes(ALL_FACILITIES, 'hasBeenIssued', false);
    });
  });
});
