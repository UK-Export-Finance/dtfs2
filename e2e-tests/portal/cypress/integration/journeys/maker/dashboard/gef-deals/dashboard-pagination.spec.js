const { gefDashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals pagination controls', () => {
  let deals;

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.deleteGefApplications(MAKER_LOGIN);

    const dummyDeals = new Array(21).fill('').map((_, i) => ({
      bankInternalRefName: `abc-${i + 1}-def`,
      bank: { id: '9' },
      exporter: { companyName: 'test' },
    }));

    cy.insertManyGefApplications(dummyDeals, MAKER_LOGIN)
      .then((insertedDeals) => {
        deals = insertedDeals;
      });
  });

  it('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {
    // login and go to the dashboard
    cy.login(MAKER_LOGIN);
    gefDashboard.visit();

    // deals will be shown in update order, so expect them upsidedown..
    const page1 = deals.slice(1, 21).reverse();
    const page2 = [deals[0]];

    // test ininital dashboard page
    gefDashboard.confirmDealsPresent(page1);
    gefDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    // prove the Next button
    gefDashboard.next().click();
    gefDashboard.confirmDealsPresent(page2);

    // prove the Previous button
    gefDashboard.previous().click();
    gefDashboard.confirmDealsPresent(page1);

    // prove the Last button
    gefDashboard.last().click();
    gefDashboard.confirmDealsPresent(page2);

    // prove the First button
    gefDashboard.first().click();
    gefDashboard.confirmDealsPresent(page1);
  });
});
