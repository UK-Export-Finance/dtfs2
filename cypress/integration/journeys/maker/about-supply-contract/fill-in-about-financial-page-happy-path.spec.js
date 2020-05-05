const {contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

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
    cy.insertOneDeal(aDealWithAboutBuyerComplete, { ...maker1 })
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login({...maker1});

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nav().aboutBuyerLink().click();
    contractAboutBuyer.nav().aboutFinancialLink().click();

    contractAboutFinancial.supplyContractValue().type('10,000');
    contractAboutFinancial.supplyContractCurrency().select('USD');
    contractAboutFinancial.conversionRateToGBP().type('76.92');

    contractAboutFinancial.saveAndGoBack().click();

    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');
    contractAboutFinancial.supplyContractCurrency().should('have.value', 'USD');
    contractAboutFinancial.conversionRateToGBP().should('have.value', '76.92');

    contractAboutFinancial.preview().click();
  });

});
