const { reports: { auditTransactionsReport }, defaults } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

context('Audit - Transactions Report', () => {
  it('Can display an empty report', () => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();
    cy.title().should('eq', `Audit - Transactions report${defaults.pageTitleAppend}`);
  });
});
