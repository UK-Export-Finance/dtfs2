const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const theDeal = require('./deal');
const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'UKEF test bank (Delegated)'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

// DTFS2-2839
context('Checker tries to submit a deal that has changed/newly issued facilities (in `Ready for check` status) with cover start dates that are not `today`', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);

    cy.insertOneDeal(theDeal, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('should throw error and not submit or redirect', () => {
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);


    pages.contract.proceedToSubmit().click();
    cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

    const expectedError = 'Requested Cover Start Date must be today or in the future';
    pages.contractConfirmSubmission.expectError(expectedError);
  });
});
