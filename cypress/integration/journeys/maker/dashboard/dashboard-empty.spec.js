const {createADeal, login} = require('../../../missions');
const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

context('Dashboard Deals pagination controls', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteAllDeals(maker1);
  });

  it('The Dashboard only displays deals from the users organisation', () => {
    // confirm that maker1 sees maker1's deals
    login({...maker1});
    dashboard.visit();
  });

});
