const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const {
  header,
  dashboardFacilities,
} = require('../../../pages');
const {
  dashboardSubNavigation,
  dashboardFilters,
} = require('../../../partials');
const {
  BSS_DEAL_AIN,
  BSS_FACILITY_BOND,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - reset after applying and navigating away', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_BOND];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1);
    });
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.url().should('eq', relative('/dashboard/facilities/0'));
  });

  it('resets filters after navigating away from the dashboard', () => {
    // toggle to show filters (hidden by default)
    dashboardFilters.showHideButton().click();

    // apply filter 1
    dashboardFacilities.filters.panel.form.type.bond.checkbox().click();

    // apply filter 2
    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().click();

    // submit filters
    dashboardFilters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // check the filters are applied
    dashboardFilters.showHideButton().click();

    dashboardFacilities.filters.panel.form.type.bond.checkbox().should('be.checked');
    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('be.checked');
    // navigate somewhere else
    cy.visit('/dashboard/deals');
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // go back to facilities dashboard
    dashboardSubNavigation.facilities().click();
    cy.url().should('eq', relative('/dashboard/facilities/0'));

    // previously applied filters should not be applied
    dashboardFacilities.filters.panel.form.type.bond.checkbox().should('not.be.checked');
    dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('not.be.checked');
  });
});
