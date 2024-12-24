const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { contract } = require('../../../pages');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('A read-only role viewing a draft deal', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal();
  });

  describe('when a read-only user views a draft deal', () => {
    it('should have no "abandon deal" link', () => {
      cy.loginGoToDealPage(BANK1_READ_ONLY1);
      cy.url().should('include', '/contract');

      contract.abandonLink().should('not.exist');
    });
  });
});
