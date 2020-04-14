const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');

context('Dashboard Deals viewed by a user with role=checker', () => {

  let dealsFromMaker1 = twentyOneDeals;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.deleteDeals(maker1);
    cy.insertManyDeals(dealsFromMaker1, { ...maker1 });
  });

  it('Dashboard defaults to showing status=readyForApproval', () => {
    cy.login({...checker});
    dashboard.visit();

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'readyForApproval');
  });

});
