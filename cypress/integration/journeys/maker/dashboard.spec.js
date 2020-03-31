const {createADeal, login} = require('../../missions');
const {deleteAllDeals, createManyDeals} = require('../../missions/deal-api');
const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');
const twentyDeals = twentyOneDeals.map(deal=>deal.details.bankDealId).slice(0,20);
const oneDeal = [twentyOneDeals[20].details.bankDealId];

context('Pick a deal from the dashboard', () => {
  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
    await createManyDeals(twentyOneDeals, { ...user });
  });

  it('The dashboard displays paginated data, pagesize=20', () => {
    login({...user});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(twentyDeals);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    //prove the Next button
    dashboard.next().click();
    dashboard.confirmDealsPresent(oneDeal);

    //prove the Previous button
    dashboard.previous().click();
    dashboard.confirmDealsPresent(twentyDeals);

    //prove the Last button
    dashboard.last().click();
    dashboard.confirmDealsPresent(oneDeal);

    //prove the First button
    dashboard.first().click();
    dashboard.confirmDealsPresent(twentyDeals);
  });
});
