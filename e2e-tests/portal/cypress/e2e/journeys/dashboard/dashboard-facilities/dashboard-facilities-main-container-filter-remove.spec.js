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

context('Dashboard Facilities - main container selected filters - remove a filter', () => {
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

    // check the filter is in the applied filters section
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('be.visible');

    // click remove button
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // should have empty applied filter
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('not.exist');

    // checkbox should be NOT be checked
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');

    // should render all facilities
    dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
  });

  it('retains other filters when one is removed', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filters
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // remove one of the filters
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().click();

    // should have removed the filter
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('not.exist');

    // should NOT have removed the other filter
    dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued().should('exist');

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check checkboxes
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().should('be.checked');
  });

  it('should remove both issued and unissued filters when they are selected and removed', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filters
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().click();
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // remove one of the filters
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().click();
    dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued().click();

    // should have removed the filter
    dashboardFacilities.filters.mainContainer.selectedFilters.typeIssued().should('not.exist');

    // should NOT have removed the other filter
    dashboardFacilities.filters.mainContainer.selectedFilters.typeUnissued().should('not.exist');

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check checkboxes
    dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');
    dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().should('not.be.checked');
  });
});
