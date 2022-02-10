const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND,
  BSS_FACILITY_LOAN,
} = require('../fixtures');
const {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
  shouldRenderOnlyGivenTypes,
} = require('./_actions-and-assertions');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Facilities filters - filter by deal notice type', () => {
  const AIN_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          AIN_FACILITIES.push({
            ...facility,
            // add the submissionType to facility just for testing
            // this makes test assertions easier than referencing deals and facilities.
            submissionType: deal.submissionType,
          });
        });
      });
    });
  });

  describe('AIN', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      submitRedirectsToDashboard(dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox());
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboardFilters.showHideButton().click();

      shouldRenderCheckedCheckbox(dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox());
    });

    it('renders the applied filter in the `applied filters` section', () => {
      shouldRenderAppliedFilterInPanelSelectedFilters('Notice Type', CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
    });

    it('renders the applied filter in the `main container selected filters` section', () => {
      shouldRenderAppliedFilterInMainContainerSelectedFilters(
        dashboardFilters.mainContainer.selectedFilters.noticeAIN(),
        CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
      );
    });

    it('renders only facilities that belong to an AIN deal', () => {
      shouldRenderOnlyGivenTypes(AIN_FACILITIES, 'submissionType', CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
    });
  });
});
