const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters, dashboardSubNavigation } = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_DEAL_MIA,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - filter by multiple fields with multiple values', () => {
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
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('submits the filters and redirects to the dashboard', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter 1
    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().click();

    // apply filter 2
    dashboardFacilities.filters.panel.form.submissionType.MIA.checkbox().click();

    // apply filter 3
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();

    // apply filter 4
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().click();

    // submit filters
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('renders checked checkboxes', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().should('be.checked');
  });

  it('renders the applied filters in the `applied filters` section', () => {
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
    const secondAppliedFilter = filters.panel.selectedFilters.listItem().eq(1);

    secondAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    secondAppliedFilter.should('have.text', expectedText);

    // applied filter 3
    const thirdAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(1);

    thirdAppliedFilterHeading.should('be.visible');
    thirdAppliedFilterHeading.should('have.text', 'Bank\'s facility stage');

    const thirdAppliedFilter = filters.panel.selectedFilters.listItem().eq(2);

    thirdAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED}`;
    thirdAppliedFilter.should('have.text', expectedText);

    // applied filter 4
    const fourthAppliedFilter = filters.panel.selectedFilters.listItem().eq(3);

    fourthAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED}`;
    fourthAppliedFilter.should('have.text', expectedText);
  });

  it('renders the applied filters in the `main container selected filters` section', () => {
    // applied filter 1
    filters.mainContainer.selectedFilters.noticeAIN().should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.AIN}`;
    filters.mainContainer.selectedFilters.noticeAIN().contains(expectedText);

    // applied filter 2
    filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    filters.mainContainer.selectedFilters.noticeMIA().contains(expectedText);

    // applied filter 3
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED}`;
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().contains(expectedText);

    // applied filter 4
    dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED}`;
    dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued().contains(expectedText);
  });

  it('renders all facilities that have matching fields - AIN deal, MIA deal, Issued stage, Unissued stage', () => {
    const EXPECTED_FACILITIES = ALL_FACILITIES.filter(({ submissionType, hasBeenIssued }) =>
      submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA
      || hasBeenIssued
      || hasBeenIssued === false);

    dashboardFacilities.rows().should('have.length', EXPECTED_FACILITIES.length);

    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('renders the correct aria-labels based on filter selected', () => {
    dashboardSubNavigation.facilities().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('facilities: ,Filters selected: , Notice Type: , Automatic Inclusion Notice, Manual Inclusion Application, Bank\'s facility stage: , Issued, Unissued');
    });

    dashboardSubNavigation.deals().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('');
    });
  });
});
