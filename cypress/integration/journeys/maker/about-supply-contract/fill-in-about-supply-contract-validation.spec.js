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
    contractAboutPreview.expectError('Supplier correspondence address is required');
    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');

    // prove the errors are on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Supplier type is required');
    contractAboutSupplier.expectError('Supplier name is required');
    contractAboutSupplier.expectError('Supplier address line 1 is required');
    contractAboutSupplier.expectError('Supplier address line 2 is required');
    contractAboutSupplier.expectError('Supplier town is required');
    // contractAboutSupplier.expectError('Supplier county is required');    // not provided by companies-house lookup
    contractAboutSupplier.expectError('Supplier postcode is required');
    //  contractAboutSupplier.expectError('Supplier country is required'); // default value applied
    contractAboutSupplier.expectError('Supplier correspondence address is required');
    contractAboutSupplier.expectError('Industry Sector is required');
    contractAboutSupplier.expectError('Industry Class is required');
    contractAboutSupplier.expectError('SME type is required');

    // open up the correspondence address to generate more errors..
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove the errors show on the preview page
    contractAboutPreview.expectError('Supplier correspondence address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address line 2 is required');
    contractAboutPreview.expectError('Supplier correspondence town is required');
    contractAboutPreview.expectError('Supplier correspondence postcode is required');

    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Supplier correspondence address line 1 is required');
    contractAboutSupplier.expectError('Supplier correspondence address line 2 is required');
    contractAboutSupplier.expectError('Supplier correspondence town is required');
    contractAboutSupplier.expectError('Supplier correspondence postcode is required');

    // open up the legally-distinct indemnifier section to generate more errors...
    contractAboutSupplier.legallyDistinct().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier address line 1 is required');
    contractAboutPreview.expectError('Indemnifier address line 2 is required');
    contractAboutPreview.expectError('Indemnifier town is required');
    contractAboutPreview.expectError('Indemnifier postcode is required');
    contractAboutPreview.expectError('Indemnifier country is required');

  });

});
