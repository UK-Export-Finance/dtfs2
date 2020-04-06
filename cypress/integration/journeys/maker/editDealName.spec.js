const {login} = require('../../missions');
const {createADeal, deleteAllDeals} = require('../../missions/deal-api');

const {contract, editDealName} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('View a deal', () => {

  let deal = {
    details: {
      bankSupplyContractID: 'abc/1/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme'
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

  it('The deal page contains the data entered in /before-you-start/bank-details', () => {
    login(user);
    contract.visit(deal);
    contract.editDealName().click();


    editDealName.bankSupplyContractName().type('{selectall}{backspace}asdfasfasf');
    editDealName.submit().click();

    contract.bankSupplyContractName().invoke('text').then((text) => {
      expect(text.trim()).equal('asdfasfasf')
    });

  });

});
