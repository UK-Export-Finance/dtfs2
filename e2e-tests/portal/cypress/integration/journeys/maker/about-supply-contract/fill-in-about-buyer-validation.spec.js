const {
  contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');

const partials = require('../../../partials');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-buyer', () => {
  let deal;

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(MAKER_LOGIN);

    contractAboutBuyer.visit(deal);
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Buyer name is required');
    contractAboutPreview.expectError('Buyer address line 1 is required');
    contractAboutPreview.expectError('Destination of Goods and Services is required');

    // prove the errors are on the about-buyer page
    contractAboutBuyer.visit(deal);
    partials.errorSummary.errorSummaryLinks().should('have.length', 5);
    contractAboutBuyer.expectError('Buyer name is required');
    contractAboutBuyer.expectError('Buyer country is required');
    contractAboutBuyer.expectError('Buyer address line 1 is required');
    contractAboutBuyer.expectError('Buyer town is required for non-UK addresses');
    contractAboutBuyer.expectError('Destination of Goods and Services is required');

    // switch to UK country
    contractAboutBuyer.buyerAddress().country().select('GBR');

    // click through
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Buyer postcode is required for UK addresses');
  });
});
