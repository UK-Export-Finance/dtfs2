const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');
const deals = require('../../../../fixtures/deal-dashboard-data');

const { READ_ONLY_ALL_BANKS, BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Access a deal', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => deals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus('Draft'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('allows read only user with all bank access to view deal', () => {
    cy.loginGoToDealPage(READ_ONLY_ALL_BANKS, deal);
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });
});
