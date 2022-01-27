const { dashboardDeals, defaults } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard deals', () => {
  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(MAKER_LOGIN);
    dashboardDeals.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});
