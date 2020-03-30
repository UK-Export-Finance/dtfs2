const {deleteAllDeals, createADeal, createManyDeals} = require('../../missions');
const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('Pick a deal from the dashboard', async () => {
  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);
  });

  it('A created deal appears on the dashboard', () => {
    const deal = {
      bankDealId: 'abc/1/def',
      bankDealName: 'Tibettan submarine acquisition scheme'
    }

    createADeal({
      ...user,
      ...deal
    });

    // log out and log back in? feels un-neccesary so not doing it...
    dashboard.visit();
    dashboard.deal('abc/1/def').click();

    cy.url().should('include', '/contract/');

  });


  it('A created deal appears on the dashboard', () => {
    const deals = [{
        bankDealId: 'abc/1/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/2/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/3/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/4/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/5/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/6/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/7/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/8/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/9/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/10/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/11/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/12/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/13/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/14/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/15/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/16/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/17/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/18/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/19/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/20/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }, {
        bankDealId: 'abc/21/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }];


console.log(`assembled deals to create :: ${JSON.stringify(deals)}`)

    createManyDeals({
      ...user,
      deals
    });

    // log out and log back in? feels un-neccesary so not doing it...
    dashboard.visit();

    dashboard.confirmDealsPresent([
      'abc/1/def',
      'abc/2/def',
      'abc/3/def',
      'abc/4/def',
      'abc/5/def',
      'abc/6/def',
      'abc/7/def',
      'abc/8/def',
      'abc/9/def',
      'abc/10/def',
      'abc/11/def',
      'abc/12/def',
      'abc/13/def',
      'abc/14/def',
      'abc/15/def',
      'abc/16/def',
      'abc/17/def',
      'abc/18/def',
      'abc/19/def',
      'abc/20/def',
    ]);

    dashboard.next().click();

    dashboard.confirmDealsPresent([
      'abc/21/def',
    ]);

  });
});
