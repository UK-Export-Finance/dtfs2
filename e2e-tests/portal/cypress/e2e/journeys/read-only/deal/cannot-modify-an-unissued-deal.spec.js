const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_READ_ONLY1, ADMIN } = MOCK_USERS;

context('A read-only role viewing a bond that can be issued', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should not allow for any publishing actions', () => {
    cy.login(BANK1_READ_ONLY1);
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    cy.url().should('include', '/contract');

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.proceedToReview().should('not.exist');
  });
});
