const { reports, defaults } = require('../../../../pages');
const { auditTransactionsReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );

context('Audit - Transactions Report', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN);
  });

  it('Can display an empty report', () => {
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();
    cy.title().should('eq', `Audit - Transactions report${defaults.pageTitleAppend}`);
  });
});
