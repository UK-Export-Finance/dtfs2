const {createADeal, login} = require('../../../missions');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');
context('Dashboard Deals pagination controls', () => {

  let persistedDeals;
  let page1;
  let page2;


  before( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clear down our test users's old deals and insert our test data
    cy.deleteAllDeals(user);
    cy.createManyDeals(twentyOneDeals, { ...user });
  });

  it('Dashboard Deals displays 20 results, the total number of items, and working First/Previous/Next/Last links.', () => {

    // login and go to the dashboard
    login({...user});
    dashboard.visit();

    cy.uncacheDeals().then( (deals) => {
      page1 = deals.slice(0,20);
      page2 = [deals[20]];

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
});
