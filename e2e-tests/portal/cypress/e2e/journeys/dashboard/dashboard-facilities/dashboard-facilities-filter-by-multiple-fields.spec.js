const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const { BSS_DEAL_AIN, BSS_DEAL_MIA, BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED } = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

const submitFilters = () => {
  // apply filter 1
  dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().click();
  // apply filter 2
  dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();
  // submit filters
  filters.panel.form.applyFiltersButton().click();
};

context('Dashboard Facilities filters - filter by multiple fields', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push({
            ...facility,
            // add the submissionType to facility just for testing
            // this makes test assertions easier than referencing deals and facilities.
            submissionType: deal.submissionType,
          });
        });
      });
    });

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_UNISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push({
            ...facility,
            // add the submissionType to facility just for testing
            // this makes test assertions easier than referencing deals and facilities.
            submissionType: deal.submissionType,
          });
        });
      });
    });
  });

  before(() => {
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardFacilities.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  it('Visit correct page', () => {
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('submits the filters and redirects to the dashboard', () => {
    submitFilters();
  });

  it('renders checked checkboxes', () => {
    submitFilters();

    filters.showHideButton().click();

    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('be.checked');
  });

  it('renders the applied filters in the `applied filters` section', () => {
    submitFilters();

    filters.showHideButton().click();

    filters.panel.selectedFilters.container().should('be.visible');
    filters.panel.selectedFilters.list().should('be.visible');

    // applied filter 1
    const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(0);

    firstAppliedFilterHeading.should('be.visible');
    firstAppliedFilterHeading.should('have.text', 'Notice Type');

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);

    firstAppliedFilter.should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.AIN}`;
    firstAppliedFilter.should('have.text', expectedText);

    // applied filter 2
    const secondAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(1);

    secondAppliedFilterHeading.should('be.visible');
    secondAppliedFilterHeading.should('have.text', "Bank's facility stage");

    const secondAppliedFilter = filters.panel.selectedFilters.listItem().eq(1);

    secondAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED}`;
    secondAppliedFilter.should('have.text', expectedText);
  });

  it('renders the applied filters in the `main container selected filters` section', () => {
    submitFilters();

    filters.showHideButton().click();

    // applied filter 1
    filters.mainContainer.selectedFilters.noticeAIN().should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.AIN}`;
    filters.mainContainer.selectedFilters.noticeAIN().contains(expectedText);

    // applied filter 2
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED}`;
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().contains(expectedText);
  });

  it('renders only facilities that have matching fields - AIN deal and Issued stage', () => {
    submitFilters();

    filters.showHideButton().click();

    const EXPECTED_FACILITIES = ALL_FACILITIES.filter(
      ({ submissionType, hasBeenIssued }) => submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN && hasBeenIssued,
    );

    dashboardFacilities.rows().should('have.length', EXPECTED_FACILITIES.length);

    const facility1 = EXPECTED_FACILITIES[0];

    dashboardFacilities.row.type(facility1._id).should('exist');
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });
});
