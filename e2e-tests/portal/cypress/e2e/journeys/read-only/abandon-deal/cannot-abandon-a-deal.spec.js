const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');
const { contract } = require('../../../pages');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('Abandon a deal', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  describe('when a read-only user views a draft deal', () => {
    it('should have no "abandon deal" link', () => {
      cy.login(BANK1_READ_ONLY1);
      cy.visit(contractUrl);
      cy.url().should('eq', contractUrl);
      contract.abandonLink().should('not.exist');
    });
  });
});
