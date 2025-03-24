const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');
const deals = require('../../../../fixtures/deal-dashboard-data');
const { contract } = require('../../../pages');

const { BANK1_READ_ONLY1, BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Abandon a deal', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => deals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus('Draft'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  describe('when a read-only user views a draft deal', () => {
    it('should have no "abandon deal" link', () => {
      cy.loginGoToDealPage(BANK1_READ_ONLY1, deal);
      cy.url().should('eq', relative(`/contract/${deal._id}`));
      contract.abandonLink().should('not.exist');
    });
  });
});
