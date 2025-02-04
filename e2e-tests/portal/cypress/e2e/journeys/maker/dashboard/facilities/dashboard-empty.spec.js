const { dashboardFacilities, defaults } = require('../../../../pages');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Transactions', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.title().should('eq', `Facilities${defaults.pageTitleAppend}`);

    cy.assertText(dashboardFacilities.totalItems(), '(0 items)');
  });
});
