const {createADeal, login} = require('../../missions');
const {deleteAllDeals, createManyDeals} = require('../../missions/deal-api');
const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOnePages = require('./twentyOneDeals');

context('Deals dashboard', () => {
  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
    await createManyDeals(twentyOnePages, { ...user });
  });

  it('The dashboard displays paginated deals, pagesize=20', () => {
    const page1 = twentyOnePages.map(deal=>deal.details.bankDealId).slice(0,20);
    const page2 = [twentyOnePages[20].details.bankDealId];

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

  xit('The user can filter "Submissions created by me"/"Submissions created by my colleagues"', () => {
    login({...user});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(page1);

    dashboard.next().click();
    dashboard.confirmDealsPresent(page2);
  });

  xit('The Dashboard only displays deals from the users organisation', () => {
    login({...user});
    dashboard.visit();

    //test ininital dashboard page
    dashboard.confirmDealsPresent(page1);

    dashboard.next().click();
    dashboard.confirmDealsPresent(page2);
  });

});
