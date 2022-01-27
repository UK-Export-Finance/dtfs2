const { dashboardFacilities, defaults } = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Transactions', () => {
  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(MAKER_LOGIN);
    dashboardFacilities.visit();
    cy.title().should('eq', `Facilities${defaults.pageTitleAppend}`);

    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(0 items)');
    });

  });
});

