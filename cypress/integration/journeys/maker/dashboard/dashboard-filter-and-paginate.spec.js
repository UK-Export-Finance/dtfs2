const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const maker_logins = mockUsers.filter( user=> (user.roles.includes('maker') && user.bank.name === 'HSBC') );
const MAKER_LOGIN_1 = maker_logins[0];
const MAKER_LOGIN_2 = maker_logins[1];

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
  let maker1deals, maker2deals;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN_1);
    cy.deleteDeals(MAKER_LOGIN_2);

    cy.insertManyDeals(twentyOneDeals, MAKER_LOGIN_1)
      .then( insertedDeals => maker1deals=insertedDeals );

    cy.insertManyDeals(renameDeals(twentyOneDeals), MAKER_LOGIN_2)
      .then( insertedDeals => maker2deals=insertedDeals );
  });

  it('Pagination and filtering work together', () => {
    // confirm that maker1 sees maker1's deals
    cy.login(MAKER_LOGIN_1);
    dashboard.visit();

    // filter
    dashboard.filterBySubmissionUser().select('createdByMe');
    dashboard.applyFilters().click();

    //confirm we're still getting our filter applied when we paginate
    // ordered by last update; so page 2 just shows our first deal..
    dashboard.next().click();
    dashboard.confirmDealsPresent([maker1deals[0]]);
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    //confirm we're still getting our filter applied when we paginate
    dashboard.filterBySubmissionUser().should('have.value', 'createdByMe')
  });

});
