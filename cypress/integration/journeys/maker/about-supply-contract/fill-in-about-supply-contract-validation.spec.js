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
    // // open up all the optional areas
    // contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    // contractAboutSupplier.legallyDistinct().click();
    // contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();

    // submit everything without adding any data
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // expect every error message -except- errors covering the 3 radio-buttons we selected ^^
    // separate test to cover those.
    contractAboutPreview.expectError('Supplier type is required');
    contractAboutPreview.expectError('Supplier name is required');

    contractAboutPreview.expectError('Supplier address line 1 is required');
    contractAboutPreview.expectError('Supplier address line 2 is required');
    contractAboutPreview.expectError('Supplier town is required');
    // companies house doesnt provide this so not mandatory
    // contractAboutPreview.expectError('Supplier county is required');
    contractAboutPreview.expectError('Supplier postcode is required');
    // default value applied so we always get a value here..
    //  contractAboutPreview.expectError('Supplier country is required');

    contractAboutPreview.expectError('Supplier correspondence address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address line 2 is required');
    contractAboutPreview.expectError('Supplier correspondence town is required');
    // companies house doesnt provide this so not mandatory
    //contractAboutPreview.expectError('Supplier correspondence county is required');
    contractAboutPreview.expectError('Supplier correspondence postcode is required');
    // default value applied so we always get a value here..
    //contractAboutPreview.expectError('Supplier correspondence country is required');

    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');



    // contractAboutPreview.indemnifierCorrespondenceAddress().postcode().invoke('text').then((text) => {
    //   expect(text.trim()).equal('CM1 4EP');
    // });


  });

});
