const { dashboardDeals, defaults } = require('../../../../pages');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard deals', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should render an empty dashboard', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});
