const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('Abandon a deal', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  describe('when a read-only user views a draft deal', () => {
    it('should have no "abandon deal" link', () => {
      cy.login(BANK1_READ_ONLY1);
      cy.visit(relative(`/contract/${bssDealId}`));
      cy.url().should('eq', relative(`/contract/${bssDealId}`));
    });
  });
});
