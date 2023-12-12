const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const deals = require('../../../../fixtures/deal-dashboard-data');

const { BANK1_READ_ONLY1, BANK1_MAKER1, ADMIN } = MOCK_USERS;
const { DEALS } = require('../../../../fixtures/constants');

context('A read-only role viewing a bond that can be issued', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => deals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus(DEALS.DEAL_STATUS.READY_FOR_APPROVAL), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should not allow for any publishing actions', () => {
    cy.login(BANK1_READ_ONLY1);
    pages.contract.visit(deal);

    cy.url().should('eq', relative(`/contract/${deal._id}`));

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.proceedToReview().should('not.exist');
  });
});
