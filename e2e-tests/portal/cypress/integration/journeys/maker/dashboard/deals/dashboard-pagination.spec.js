const { dashboardDeals } = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const twentyOneDeals = require('../../../../../fixtures/deal-dashboard-data');

context('Dashboard Deals pagination controls', () => {
  let deals;

  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.deleteDeals(MAKER_LOGIN);

    cy.insertManyDeals(twentyOneDeals, MAKER_LOGIN)
      .then((insertedDeals) => { deals = insertedDeals; });
  });

  it('Dashboard Deals displays 20 results per page, total number of items and working First/Previous/Next/Last links', () => {
    // login and go to the dashboard
    cy.login(MAKER_LOGIN);
    dashboardDeals.visit();

    // deals will be shown in update order, so expect them upsidedown..
    const page1 = deals.slice(1, 21).reverse();
    const page2 = [deals[0]];

    // test iniital dashboard page
    dashboardDeals.confirmDealsPresent(page1);
    dashboardDeals.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    // prove the Next button
    dashboardDeals.next().click();
    dashboardDeals.confirmDealsPresent(page2);

    // prove the Previous button
    dashboardDeals.previous().click();
    dashboardDeals.confirmDealsPresent(page1);

    // prove the Last button
    dashboardDeals.last().click();
    dashboardDeals.confirmDealsPresent(page2);

    // prove the First button
    dashboardDeals.first().click();
    dashboardDeals.confirmDealsPresent(page1);
  });
});
