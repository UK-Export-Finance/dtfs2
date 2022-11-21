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

const { BANK1_MAKER1, BANK1_MAKER2, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - Created by you', () => {
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
            makerUser: BANK1_MAKER1.username,
          });
        });
      });
    });

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER2).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_UNISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER2).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push({
            ...facility,
            // add the submissionType to facility just for testing
            // this makes test assertions easier than referencing deals and facilities.
            submissionType: deal.submissionType,
            makerUser: BANK1_MAKER2.username,
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

  it('should apply created by you filter', () => {
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply created by you filter
    dashboardFacilities.filters.panel.form.createdByYou.checkbox().click();

    // submit filters
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('should have the correct number of facilities when createdByYou selected', () => {
    const EXPECTED_FACILITIES = ALL_FACILITIES.filter(({ makerUser }) => makerUser === BANK1_MAKER1.username);

    dashboardFacilities.rows().should('have.length', EXPECTED_FACILITIES.length);
  });

  it('should have the correct labels when createdByYou selected', () => {
    dashboardFacilities.filters.mainContainer.selectedFilters.createdByYou().should('be.visible');

    filters.showHideButton().click();

    const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(0);

    // does not have heading
    firstAppliedFilterHeading.should('not.be.visible');

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);

    firstAppliedFilter.should('be.visible');

    const expectedText = 'Remove this filter Created by you';
    firstAppliedFilter.should('have.text', expectedText);

    dashboardFacilities.filters.panel.form.createdByYou.checkbox().should('be.checked');

    dashboardSubNavigation.facilities().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('facilities: ,Filters selected: , : , Created by you');
    });
  });

  it('should be able to remove filter from filter container and see all facilities again', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardFacilities.filters.panel.form.createdByYou.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    filters.showHideButton().click();

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);
    firstAppliedFilter.click();

    filters.panel.selectedFilters.listItem().should('not.exist');
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });

  it('should be able to remove filter from main container and see all facilities again', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardFacilities.filters.panel.form.createdByYou.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    dashboardFacilities.filters.mainContainer.selectedFilters.createdByYou().click('');

    dashboardFacilities.filters.mainContainer.selectedFilters.createdByYou().should('not.exist');
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });

  it('renders all facilities that have matching fields for all filters including created by you', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    filters.showHideButton().click();
    dashboardFacilities.filters.panel.form.createdByYou.checkbox().click();
    dashboardFacilities.filters.panel.form.type.bond.checkbox().click();
    dashboardFacilities.filters.panel.form.type.loan.checkbox().click();
    dashboardFacilities.filters.panel.form.type.cash.checkbox().click();
    dashboardFacilities.filters.panel.form.type.contingent.checkbox().click();
    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().click();
    dashboardFacilities.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardFacilities.filters.panel.form.submissionType.MIN.checkbox().click();
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    const EXPECTED_FACILITIES = ALL_FACILITIES.filter(({
      type, submissionType, hasBeenIssued, makerUser,
    }) =>
      (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
        || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA
        || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN)
      && (hasBeenIssued || hasBeenIssued === false)
      && (type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND
        || type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN
        || type === CONSTANTS.FACILITY.FACILITY_TYPE.CASH
        || type === CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT)
        && (makerUser === BANK1_MAKER1.username));

    dashboardFacilities.rows().should('have.length', EXPECTED_FACILITIES.length);

    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });
});
