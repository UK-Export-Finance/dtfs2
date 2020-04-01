const {login} = require('../../../missions');
const {createADeal, deleteAllDeals} = require('../../../missions/deal-api');

const {dashboard} = require('../../../pages');
const relative = require('../../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('View a deal', () => {

  let deal = {
    details: {
      bankDealId: 'abc/1/def',
      bankDealName: 'Tibettan submarine acquisition scheme'
    }
  };

  beforeEach( async() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clear down our test users old deals, and insert a new one - updating our deal object
    await deleteAllDeals(user);
    deal = await createADeal(deal, user);
  });

  it('A created deal appears on the dashboard', () => {

    // login and go to dashboard
    login(user);
    dashboard.visit();

    // get the row that corresponds to our deal
    const row = dashboard.row(deal);

    //check the fields we understand
    row.bank().invoke('text').then((text) => {
      expect(text.trim()).equal('Barclays Bank')
    });

    row.bankDealId().invoke('text').then((text) => {
      expect(text.trim()).equal('abc/1/def')
    });

    row.maker().invoke('text').then((text) => {
      expect(text.trim()).equal('MAKER')
    });

    row.updated().invoke('text').then((text) => {
      //TODO - check formatting once formatting known
      expect(text.trim()).to.not.equal('')
    });

    //TODO - other fields as we start to populate them...


    row.bankDealId().contains(`abc/1/def`).click();

    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

});
