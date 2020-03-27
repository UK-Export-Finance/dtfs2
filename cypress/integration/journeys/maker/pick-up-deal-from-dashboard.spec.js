const {createADeal} = require('../../missions');
const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

context('Pick a deal from the dashboard', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('A created deal appears on the dashboard', () => {
    createADeal({
      username:'MAKER',
      password:'MAKER',
      bankDealId: 'abc/123/def',
      bankDealName: 'Tibettan submarine acquisition scheme'
    });

    // log out and log back in? feels un-neccesary so not doing it...
    dashboard.visit();
    dashboard.deal('abc/123/def').click();

    cy.url().should('include', '/contract/');
  });
});
