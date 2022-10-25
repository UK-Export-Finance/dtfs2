const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - remove all filters', () => {
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

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('removes all applied filters by clicking `clear filters` button', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter 1
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();

    // apply filter 2
    dashboardFacilities.filters.panel.form.type.bond.checkbox().click();

    // submit filters
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check filters are applied
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.type.bond.checkbox().should('be.checked');

    // click `clear all` button
    filters.panel.selectedFilters.clearAllLink().should('be.visible');
    filters.panel.selectedFilters.clearAllLink().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
    filters.panel.container().should('be.visible');

    // should have empty panel applied filters
    filters.panel.selectedFilters.container().should('not.exist');
    filters.panel.selectedFilters.list().should('not.exist');

    // should have empty main container applied filters
    filters.mainContainer.selectedFilters.container().should('not.exist');

    // checkbox should be NOT be checked
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');
    dashboardFacilities.filters.panel.form.type.bond.checkbox().should('not.be.checked');

    // should render all facilities
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });
});
