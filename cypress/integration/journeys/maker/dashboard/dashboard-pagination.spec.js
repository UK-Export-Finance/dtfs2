const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');
const page1 = twentyOneDeals.map(deal=>deal.details.bankDealId).slice(0,20);
const page2 = [twentyOneDeals[20].details.bankDealId];

context('Dashboard Deals pagination controls', () => {

  before( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
    await createManyDeals(twentyOneDeals, { ...user });
  });

  it('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {

    login({...user});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(page1);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    //prove the Next button
    dashboard.next().click();
    dashboard.confirmDealsPresent(page2);

    //prove the Previous button
    dashboard.previous().click();
    dashboard.confirmDealsPresent(page1);

    //prove the Last button
    dashboard.last().click();
    dashboard.confirmDealsPresent(page2);

    //prove the First button
    dashboard.first().click();
    dashboard.confirmDealsPresent(page1);
  });
});
