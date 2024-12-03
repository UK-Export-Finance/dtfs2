const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardFacilities } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');

const { BANK1_MAKER1 } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard facilities filters - Deal cancellation feature flag disabled', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
  });

  describe('When deal cancellation is disabled on the dashboard facilities page', () => {
    it('should not display the risk expired status filter', () => {
      dashboardFacilities.visit();
      filters.showHideButton().click();

      dashboardFacilities.filters.panel.form.stage.issued.label().should('not.exist');
      dashboardFacilities.filters.panel.form.stage.issued.checkbox().should('not.exist');
    });
  });
});
