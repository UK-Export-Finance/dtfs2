const { transactionDashboard, defaults } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

context('Dashboard Transactions', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN);
  });

  it('Can display an empty dashboard', () => {
    cy.login(MAKER_LOGIN);
    transactionDashboard.visit();
    cy.title().should('eq', `Transactions${defaults.pageTitleAppend}`);
  });
});
