const {login} = require('../../../missions');
const {createADeal, deleteAllDeals} = require('../../../missions/deal-api');

const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('View a deal', () => {

  let deal;

  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    await deleteAllDeals(user);

    //create a template
    deal = {
      details: {
        bankDealId: 'abc/1/def',
        bankDealName: 'Tibettan submarine acquisition scheme'
      }
    };

    //update from API response
    deal = await createADeal(deal, user);
  });

  it('A created deal appears on the dashboard', () => {
    login(user);

    dashboard.visit();

    const row = dashboard.row(deal);

    row.bank().invoke('text').then((text) => {
      expect(text.trim()).equal('Barclays Bank')
    });

    row.bankDealId().invoke('text').then((text) => {
      expect(text.trim()).equal('abc/1/def')
    });

//TODO - other fields as we start to populate them...

    row.maker().invoke('text').then((text) => {
      expect(text.trim()).equal('MAKER')
    });

    row.updated().invoke('text').then((text) => {
      expect(text.trim()).to.not.equal('')
    });

    //
    // cy.get(`#deal_${deal._id}`)
    //   .contains(user.username)
    //
    // row.bankDealId().click()
    // cy.url().should('eq', `/contract/${deal._id}`);
  });

});
