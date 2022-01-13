const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals - main container selected filters - remove a filter', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('applies and removes a filter', () => {
    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // apply filter
    dashboard.filterCheckboxSubmissionTypeMIA().click();
    dashboard.filtersApplyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filter is in the applied filters section
    dashboard.filtersSelectedMainContainerNoticeMIA().should('be.visible');

    // click remove button
    dashboard.filtersSelectedMainContainerNoticeMIA().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // should have empty applied filter
    dashboard.filtersSelectedMainContainerNoticeMIA().should('not.exist');

    // checkbox should be NOT be checked
    dashboard.filterCheckboxSubmissionTypeMIA().should('not.be.checked');

    // should render all deals
    dashboard.rows().should('have.length', ALL_DEALS.length);
  });
});
