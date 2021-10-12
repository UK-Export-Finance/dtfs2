const { dashboard } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../../fixtures/deal-dashboard-data');

context('Dashboard Deals pagination controls', () => {
  let deals;

  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(twentyOneDeals, MAKER_LOGIN)
      .then((insertedDeals) => { deals = insertedDeals; });
  });

  it('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {
    // login and go to the dashboard
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    // deals will be shown in update order, so expect them upsidedown..
    const page1 = deals.slice(1, 21).reverse();
    const page2 = [deals[0]];

    // test ininital dashboard page
    dashboard.confirmDealsPresent(page1);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    // prove the Next button
    dashboard.next().click();
    dashboard.confirmDealsPresent(page2);

    // prove the Previous button
    dashboard.previous().click();
    dashboard.confirmDealsPresent(page1);

    // prove the Last button
    dashboard.last().click();
    dashboard.confirmDealsPresent(page2);

    // prove the First button
    dashboard.first().click();
    dashboard.confirmDealsPresent(page1);
  });
});
