const { dashboardFacilities, defaults } = require('../../../../pages');
const {
  MOCK_DEALS,
  MOCK_USERS,
} = require('../fixtures');

const {
  BANK1_MAKER1,
  ADMIN,
} = MOCK_USERS;

context('Dashboard Transactions', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(BANK1_MAKER1);
    dashboardFacilities.visit();
    cy.title().should('eq', `Facilities${defaults.pageTitleAppend}`);

    dashboardFacilities.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(0 items)');
    });
  });
});

