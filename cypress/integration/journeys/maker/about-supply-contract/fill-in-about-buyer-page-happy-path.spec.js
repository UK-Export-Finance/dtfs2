const {contract, contractAboutSupplier} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, { ...maker1 })
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login({...maker1});

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });
    contract.aboutSupplierDetailsLink().click();

    contractAboutSupplier.nav().aboutBuyerLink().click();

  });

});
