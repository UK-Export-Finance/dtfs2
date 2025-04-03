const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

const { READ_ONLY_ALL_BANKS, ADMIN } = MOCK_USERS;

context('Access a deal', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  it('allows read only user with all bank access to view deal', () => {
    cy.login(READ_ONLY_ALL_BANKS);
    cy.visit(contractUrl);
    cy.url().should('eq', contractUrl);
  });
});
