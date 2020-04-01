const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const maker2 = {username:'MAKER-2', password: 'MAKER-2'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');
const fiveDealsFromMaker1 = twentyOneDeals.slice(0,5);
const fiveDealsFromMaker2 = twentyOneDeals.slice(5,10);

context('Dashboard Deals pagination controls', () => {

  before( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(maker1);
    await deleteAllDeals(maker2);
    await createManyDeals(fiveDealsFromMaker1, { ...maker1 });
    await createManyDeals(fiveDealsFromMaker2, { ...maker2 });
  });

  it('The Dashboard only displays deals from the users organisation', () => {
    login({...maker1});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(fiveDealsFromMaker1.map(deal=>deal.details.bankDealId));

    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

    login({...maker2});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(fiveDealsFromMaker2.map(deal=>deal.details.bankDealId));

    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });

  });

  // xit('The user can filter "Submissions created by me"/"Submissions created by my colleagues"', () => {
  //   login({...user});
  //   dashboard.visit();
  //
  //   //test ininital dashboard page
  //   dashboard.confirmDealsPresent(page1);
  //
  //   dashboard.next().click();
  //   dashboard.confirmDealsPresent(page2);
  // });
  //
  // xit('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {
  //
  //   login({...user});
  //   dashboard.visit();
  //
  //   //test ininital dashboard page
  //   dashboard.confirmDealsPresent(page1);
  //   dashboard.totalItems().invoke('text').then((text) => {
  //     expect(text.trim()).equal('(21 items)');
  //   });
  //
  //   //prove the Next button
  //   dashboard.next().click();
  //   dashboard.confirmDealsPresent(page2);
  //
  //   //prove the Previous button
  //   dashboard.previous().click();
  //   dashboard.confirmDealsPresent(page1);
  //
  //   //prove the Last button
  //   dashboard.last().click();
  //   dashboard.confirmDealsPresent(page2);
  //
  //   //prove the First button
  //   dashboard.first().click();
  //   dashboard.confirmDealsPresent(page1);
  // });
});
