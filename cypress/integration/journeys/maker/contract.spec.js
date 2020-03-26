const {createADeal} = require('../../missions');
const {contract} = require('../../pages');
const relative = require('../../relativeURL');

context('View a deal', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('The deal page contains the data entered in /before-you-start/bank-details', () => {
    createADeal({
      username:'editor',
      password:'editor',
      bankDealId: 'someDealId',
      bankDealName: 'someDealName'
    });

    contract.bankSupplyContractID().invoke('text').then((text) => {
      expect(text.trim()).equal('someDealId')
    });

    contract.supplyContractName().invoke('text').then((text) => {
      expect(text.trim()).equal('someDealName')
    });

  });
});
