const { reports, defaults } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );

context('Audit - Report', () => {
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
    auditSupplyContracts.visit();
    cy.title().should('eq', `Audit report${defaults.pageTitleAppend}`);
  });
});
