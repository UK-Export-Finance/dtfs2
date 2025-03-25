const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

const EXPECTED_DEALS_LENGTH = 2;

context('Dashboard Deals - main container selected filters - remove a filter', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('should apply and remove a filter', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filter
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filter is in the applied filters section
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    // click remove button
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // should have empty applied filter
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('not.exist');

    // checkbox should be NOT be checked
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboardDeals.rows().should('have.length', EXPECTED_DEALS_LENGTH);
  });

  it('should retain other filters when one is removed', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply filters
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // remove one of the filters
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().click();
    dashboardDeals.filters.mainContainer.selectedFilters.noticeAIN().click();
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIN().click();

    // should have removed the filter
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('not.exist');
    dashboardDeals.filters.mainContainer.selectedFilters.noticeAIN().should('not.exist');
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIN().should('not.exist');

    // should NOT have removed the other filter
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('exist');

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // check checkboxes
    dashboardDeals.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
  });
});
