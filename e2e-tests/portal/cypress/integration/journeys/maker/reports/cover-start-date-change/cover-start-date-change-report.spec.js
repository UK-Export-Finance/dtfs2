const { reports: { coverStartDateReport } } = require('../../../../pages');
const { aDealWithOneBond, aDealWithOneLoan, aDealWithOneLoanAndOneBond } = require('../../../../../fixtures/transaction-dashboard-data');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

context('MIA MIN cover start date changes', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneBond, MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN);
  });

  it('can be filtered by create date', () => {
    cy.login(MAKER_LOGIN);
    coverStartDateReport.visit();

    // we've loaded 3 deals;
    //  one has a bond- no update- should not display
    //  one has a loan with an update- should display
    // one has a bond with an update, and a loan without an update
    //  therefore i expect to see 2 things; and this proves that
    //  i'm finding all the deals i should, and that i'm correctly
    //  filtering out the transactions that don't match
    coverStartDateReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)'); // based on the test data
    });
  });
});
