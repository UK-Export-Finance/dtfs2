const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const maker2 = {username:'MAKER-2', password: 'MAKER-2'};
const maker3 = {username:'MAKER-3', password: 'MAKER-3'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');

context('Dashboard Deals pagination controls', () => {

  let fiveDealsFromMaker1 = twentyOneDeals.slice(0,5);
  let fiveDealsFromMaker2 = twentyOneDeals.slice(5,10);
  let fiveDealsFromMaker3 = twentyOneDeals.slice(10,15);

  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clean down anything our test-users have created
    // await deleteAllDeals(maker3);
    await deleteAllDeals(maker1);
    await deleteAllDeals(maker2);
    await deleteAllDeals(maker3);
    // insert deals as each user
    fiveDealsFromMaker1 = await createManyDeals(fiveDealsFromMaker1, { ...maker1 });
    fiveDealsFromMaker2 = await createManyDeals(fiveDealsFromMaker2, { ...maker2 });
    fiveDealsFromMaker3 = await createManyDeals(fiveDealsFromMaker3, { ...maker3 });
  });

  it('The Dashboard only displays deals from the users organisation', () => {
    // confirm that maker2 sees maker3's deals
    login({...maker2});
    dashboard.visit();

    dashboard.filterBySubmissionUser().select('createdByColleagues');
    dashboard.applyFilters().click();

    dashboard.confirmDealsPresent(fiveDealsFromMaker3);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(5 items)');
    });
  });

});
