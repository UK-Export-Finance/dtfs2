const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

const { READ_ONLY_ALL_BANKS, ADMIN } = MOCK_USERS;

context('Access a deal', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  it('allows read only user with all bank access to view deal', () => {
    cy.login(READ_ONLY_ALL_BANKS);
    cy.visit(relative(`/contract/${bssDealId}`));
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });
});
