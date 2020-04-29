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
  let maker2deals, maker3deals;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(maker2);
    cy.deleteDeals(maker3);

    cy.insertManyDeals(twentyOneDeals, { ...maker2 })
      .then( insertedDeals => maker2deals=insertedDeals );

    cy.insertManyDeals(renameDeals(twentyOneDeals), { ...maker3 })
      .then( insertedDeals => maker3deals=insertedDeals );
  });

  it('Pagination and filtering work together', () => {
    // confirm that maker2 sees maker2's deals
    cy.login({...maker2});
    dashboard.visit();

    // filter
    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    //confirm we're still getting our filter applied when we paginate
    // ordered by last update; so page 2 just shows our first deal..
    dashboard.next().click();
    dashboard.confirmDealsPresent([maker2deals[0]]);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    //confirm we're still getting our filter applied when we paginate
    dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
  });

});
