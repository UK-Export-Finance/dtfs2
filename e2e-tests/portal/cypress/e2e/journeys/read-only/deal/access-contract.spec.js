const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { READ_ONLY_ALL_BANKS, ADMIN } = MOCK_USERS;

context('Access a deal', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssDeal({});
  });

  it('allows read only user with all bank access to view deal', () => {
    cy.loginGoToDealPage(READ_ONLY_ALL_BANKS);
    cy.url().should('include', '/contract');
  });
});
