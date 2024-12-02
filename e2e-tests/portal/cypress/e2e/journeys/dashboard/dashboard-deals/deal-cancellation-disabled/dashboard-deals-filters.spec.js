const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');

const { BANK1_MAKER1 } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - Deal cancellation feature flag disabled', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
  });

  describe('When deal cancellation is disabled on the dashboard deals page', () => {
    it('does not display the deal cancellation status filter', () => {
      dashboardDeals.visit();
      filters.showHideButton().click();

      dashboardDeals.filters.panel.form.status.cancelled.label().should('not.exist');
      dashboardDeals.filters.panel.form.status.cancelled.checkbox().should('not.exist');
    });
  });
});
