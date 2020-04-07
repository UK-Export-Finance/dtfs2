const {createADeal, login} = require('../../../missions');
const {deleteAllDeals, createManyDeals} = require('../../../missions/deal-api');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker2 = {username:'MAKER-2', password: 'MAKER-2'};
const maker3 = {username:'MAKER-3', password: 'MAKER-3'};

// test data we want to set up + work with..
const twentyOneDeals = require('./twentyOneDeals');
const renameDeals = (deals) => {
  return deals.map( (deal)=>{
    return {
      ...deal,
      details: {
        ...deal.details,
        bankSupplyContractID: `${deal.details.bankSupplyContractID}_2`,
        bankSupplyContractName: `${deal.details.bankSupplyContractName}_2`,
      }
    }
  });
}
context('Dashboard Deals pagination controls', () => {

  let twentyOneDealsFromMaker2 = twentyOneDeals;
  let twentyOneDealsFromMaker3 = renameDeals(twentyOneDeals);

  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clean down anything our test-users have created
    await deleteAllDeals(maker2);
    await deleteAllDeals(maker3);
    // insert deals as each user
    twentyOneDealsFromMaker2 = await createManyDeals(twentyOneDealsFromMaker2, { ...maker2 });
    twentyOneDealsFromMaker3 = await createManyDeals(twentyOneDealsFromMaker3, { ...maker3 });
  });

  it('Pagination and filtering work together', () => {
    // confirm that maker2 sees maker2's deals
    login({...maker2});
    dashboard.visit();

    // filter
    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    //confirm we're still getting our filter applied when we paginate
    dashboard.next().click();
    dashboard.confirmDealsPresent(twentyOneDealsFromMaker2.slice(20,21));
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    //confirm we're still getting our filter applied when we paginate
    dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
  });

});
