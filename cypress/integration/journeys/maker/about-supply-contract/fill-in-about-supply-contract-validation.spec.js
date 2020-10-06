const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');
const partials = require('../../../partials');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

context('about-supply-contract', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    const aDealWith_AboutSupplyContract_InStatus = (status) => {
      const candidates = twentyOneDeals
        .filter((deal) => (deal.submissionDetails && status === deal.submissionDetails.status))
        .filter((deal) => (deal.details && deal.details.status === 'Draft'));

      const deal = candidates[0];
      if (!deal) {
        throw new Error('no suitable test data found');
      } else {
        return deal;
      }
    };

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWith_AboutSupplyContract_InStatus('Incomplete'), MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(MAKER_LOGIN);

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.supplierName().clear();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    partials.errorSummary.errorSummaryLinks().should('have.length', 18);

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supplier type is required');
    contractAboutPreview.expectError('Supplier name is required');
    contractAboutPreview.expectError('Supplier address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address is required');
    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');

    // prove the errors are on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Supplier type is required');
    contractAboutSupplier.expectError('Supplier name is required');
    contractAboutSupplier.expectError('Supplier address line 1 is required');
    contractAboutSupplier.expectError('Supplier correspondence address is required');
    contractAboutSupplier.expectError('Industry Sector is required');
    contractAboutSupplier.expectError('Industry Class is required');
    contractAboutSupplier.expectError('SME type is required');
    contractAboutSupplier.expectError('Supplier town is required for non-UK addresses');

    // switch to UK country
    contractAboutSupplier.supplierAddress().country().select('GBR');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutSupplier.visit(deal);
    // open up the correspondence address to generate more errors..
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('GBR');
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove the errors show on the preview page
    contractAboutPreview.expectError('Supplier postcode is required for UK addresses');
    contractAboutPreview.expectError('Supplier correspondence postcode is required for UK addresses');

    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Supplier postcode is required for UK addresses');
    contractAboutSupplier.expectError('Supplier correspondence postcode is required for UK addresses');

    // switch to non-UK country
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Supplier correspondence postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Supplier correspondence town is required for non-UK addresses');

    contractAboutSupplier.visit(deal);
    // open up the legally-distinct indemnifier section to generate more errors...
    contractAboutSupplier.legallyDistinct().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier name is required');
    contractAboutPreview.expectError('Indemnifier address line 1 is required');


    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Indemnifier address line 1 is require');

    // switch to non-UK country
    contractAboutSupplier.indemnifierAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Indemnifier postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Indemnifier town is required for non-UK addresses');

    // open up the indemnifier correspondence address section to generate more errors...
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier correspondence address line 1 is required');

    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.expectError('Indemnifier correspondence address line 1 is required');

    // switch to non-UK country
    contractAboutSupplier.indemnifierCorrespondenceAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Indemnifier correspondence postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Indemnifier correspondence town is required for non-UK addresses');
  });
});
