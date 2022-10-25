const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const theDeal = require('./deal');
const MOCK_USERS = require('../../../../fixtures/users');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

// DTFS2-2839
context('Checker tries to submit a deal that has changed/newly issued facilities (in `Ready for check` status) with cover start dates that are before MIN submission date', () => {
  let deal;
  let dealId;

  before(() => {
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(theDeal, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;
      });
  });

  it('should throw error and not submit or redirect', () => {
    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

    const expectedError = 'Requested Cover Start Date must be on the application submission date or in the future';
    pages.contractConfirmSubmission.expectError(expectedError);
  });
});
