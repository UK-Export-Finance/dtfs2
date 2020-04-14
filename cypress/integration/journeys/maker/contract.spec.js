const {createADeal} = require('../../missions');

const {contract, dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('View a deal', () => {
  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(user);
  });

  it('The deal page contains the data entered in /before-you-start/bank-details', () => {
    createADeal({
      ... user,
      bankDealId: 'someDealId',
      bankDealName: 'someDealName'
    });

    contract.bankSupplyContractID().invoke('text').then((text) => {
      expect(text.trim()).equal('someDealId')
    });

    contract.bankSupplyContractName().invoke('text').then((text) => {
      expect(text.trim()).equal('someDealName')
    });

    contract.maker().invoke('text').then((text) => {
      expect(text.trim()).to.equal('MAKER')
    });

    const regexDate = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d]/
    contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDate)
    });

    const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/
    contract.dateOfLastAction().invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDateTime)
    });


  });

});
