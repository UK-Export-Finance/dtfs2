const { DEAL_STATUS } = require('@ukef/dtfs2-common');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { BSS_DEAL_DRAFT, GEF_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - Deal cancellation enabled', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardDeals.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  describe('When deal cancellation is enabled', () => {
    it('displays the deal cancellation status filter', () => {
      dashboardDeals.filters.panel.form.status.cancelled.label().contains(DEAL_STATUS.CANCELLED);
      dashboardDeals.filters.panel.form.status.cancelled.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.cancelled.checkbox().should('not.be.checked');
    });
  });
});
