const pages = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
  bondTransactions: {
    items: [
      { _id: '1234' },
      { _id: '5678' },
      { _id: '9112' },
    ],
  },
};

context('Delete a Bond', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Deleting a bond via the Deal page should remove the bond and redirect back to the Deal page', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.bondTransactionsTableRows().should('have.length', 3);

    const bondToDeleteId = deal.bondTransactions.items[1]._id; // eslint-disable-line no-underscore-dangle
    const bondToDeleteRow = pages.contract.bondTransactionsTable.row(bondToDeleteId);

    bondToDeleteRow.deleteLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondToDeleteId}/delete`));

    pages.bondDelete.submit().click();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    pages.contract.bondTransactionsTableRows().should('have.length', 2);
    pages.contract.bondTransactionsTable.row(bondToDeleteId).row.should('not.exist');
  });
});
