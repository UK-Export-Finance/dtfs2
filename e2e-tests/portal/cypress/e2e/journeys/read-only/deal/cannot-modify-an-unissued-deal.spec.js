const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('A read-only role viewing a bond that can be issued', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should not allow for any publishing actions', () => {
    cy.login(BANK1_READ_ONLY1);
    cy.visit(contractUrl);

    cy.url().should('eq', contractUrl);

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.proceedToReview().should('not.exist');
  });
});
