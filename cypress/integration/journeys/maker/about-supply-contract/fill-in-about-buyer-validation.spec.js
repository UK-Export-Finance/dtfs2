const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-buyer', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(MAKER_LOGIN);

    contractAboutBuyer.visit(deal);
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Buyer name is required');
    contractAboutPreview.expectError('Buyer address line 1 is required');
    // since we have the default country (UK) postcode should be required
    contractAboutPreview.expectError('Buyer postcode is required for UK addresses');

    // prove the errors are on the about-buyer page
    contractAboutBuyer.visit(deal);
    contractAboutBuyer.expectError('Buyer name is required');
    contractAboutBuyer.expectError('Buyer address line 1 is required');
    // since we have the default country (UK) postcode should be required
    contractAboutBuyer.expectError('Buyer postcode is required for UK addresses');

    // switch to non-UK country
    contractAboutBuyer.buyerAddress().country().select('USA');
    // click through
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Buyer postcode is required for UK addresses')
    contractAboutPreview.errors().should('contain', 'Buyer town is required for non-UK addresses')
  });
});
