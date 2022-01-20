/*
const { gefFacilitiesDashboard, defaults } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Transactions', () => {
  it('Can display an empty dashboard', () => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.login(MAKER_LOGIN);
    gefFacilitiesDashboard.visit();
    cy.title().should('eq', `Facilities${defaults.pageTitleAppend}`);
  });
});
*/
