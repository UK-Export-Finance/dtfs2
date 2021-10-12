const { reports, defaults } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const { auditSupplyContracts } = reports;
const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

context('Audit - Report', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN_LOGIN);
  });

  it('Can display an empty report', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();
    cy.title().should('eq', `Audit report${defaults.pageTitleAppend}`);
  });
});
