const { gefDashboard, defaults } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals', () => {
  it('Can display an empty dashboard', () => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.login(MAKER_LOGIN);
    gefDashboard.visit();
    cy.title().should('eq', `Deals${defaults.pageTitleAppend}`);
  });
});
