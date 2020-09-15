const { reports, defaults } = require('../../../../pages');
const { reconciliationReport } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );

context('reconciliation report', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(ADMIN_LOGIN);
  });

  it('Can display an empty report', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();
    cy.title().should('eq', `Audit report${defaults.pageTitleAppend}`);
  });
});
