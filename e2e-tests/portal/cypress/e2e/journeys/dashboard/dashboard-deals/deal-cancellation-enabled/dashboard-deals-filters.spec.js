const { DEAL_STATUS } = require('@ukef/dtfs2-common');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');

const { BANK1_MAKER1 } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - Deal cancellation enabled', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
  });

  describe('When deal cancellation is enabled on the dashboard deals page', () => {
    it('displays the deal cancellation status filter', () => {
      dashboardDeals.visit();
      filters.showHideButton().click();

      dashboardDeals.filters.panel.form.status.cancelled.label().contains(DEAL_STATUS.CANCELLED);
      dashboardDeals.filters.panel.form.status.cancelled.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.cancelled.checkbox().should('not.be.checked');
    });
  });
});
