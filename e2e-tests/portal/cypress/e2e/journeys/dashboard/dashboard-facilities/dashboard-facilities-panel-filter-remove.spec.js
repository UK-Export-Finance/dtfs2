const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND_ISSUED,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities - panel selected filters - remove a filter', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND_ISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });

    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('applies and removes a filter', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check the filter is in the applied filters section
    const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();
    firstAppliedFilter.should('be.visible');

    // click remove button
    firstAppliedFilter.click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
    filters.panel.container().should('be.visible');

    // should have empty applied filters
    filters.panel.selectedFilters.container().should('not.exist');
    filters.panel.selectedFilters.list().should('not.exist');

    // checkbox should be NOT be checked
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');

    // should render all facilities
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });
});
