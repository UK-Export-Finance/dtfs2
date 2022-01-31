const { dashboardDeals, defaults } = require('../../../../pages');

const { MOCK_DEALS, MOCK_USERS } = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard deals', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});
