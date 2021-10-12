const { dashboard, defaults } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard BSS Deals', () => {
  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(MAKER_LOGIN);
    dashboard.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});
