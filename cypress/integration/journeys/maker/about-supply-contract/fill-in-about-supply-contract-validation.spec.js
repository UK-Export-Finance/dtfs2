const {contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../dashboard/twentyOneDeals');


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
    const aDealWith_AboutSupplyContract_InStatus = (status) => {
      const candidates = twentyOneDeals
        .filter( deal=> (deal.submissionDetails && status === deal.submissionDetails.status) )
        .filter( deal=> (deal.details && deal.details.status === 'Draft'));

      const deal = candidates[0];
      if (!deal) {
        throw new Error("no suitable test data found");
      } else {
        return deal;
      }
    };

    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealWith_AboutSupplyContract_InStatus('Not Started'), { ...maker1 })
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login({...maker1});

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supplier type is required');
    contractAboutPreview.expectError('Supplier name is required');
    contractAboutPreview.expectError('Supplier address line 1 is required');
    contractAboutPreview.expectError('Supplier address line 2 is required');
    contractAboutPreview.expectError('Supplier town is required');
    // contractAboutPreview.expectError('Supplier county is required');    // not provided by companies-house lookup
    contractAboutPreview.expectError('Supplier postcode is required');
    //  contractAboutPreview.expectError('Supplier country is required'); // default value applied
    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');

    // go back and start opening up optional areas and coming back to look for errors..
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Supplier correspondence address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address line 2 is required');
    contractAboutPreview.expectError('Supplier correspondence town is required');
    contractAboutPreview.expectError('Supplier correspondence postcode is required');



  });

});
