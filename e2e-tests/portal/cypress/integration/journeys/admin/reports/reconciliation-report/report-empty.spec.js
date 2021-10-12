const { reports: { reconciliationReport }, defaults } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

context('reconciliation report', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN_LOGIN);
  });

  it('Can display an empty report', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();
    cy.title().should('eq', `Reconciliation Report${defaults.pageTitleAppend}`);
  });
});
