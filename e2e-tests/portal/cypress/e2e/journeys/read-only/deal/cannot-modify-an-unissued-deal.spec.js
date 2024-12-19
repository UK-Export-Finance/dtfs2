const { contract } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('A read-only role viewing a draft deal', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should not allow for any publishing actions', () => {
    cy.loginGoToDealPage(BANK1_READ_ONLY1);

    cy.url().should('include', '/contract');

    contract.proceedToSubmit().should('not.exist');
    contract.proceedToReview().should('not.exist');
  });
});
