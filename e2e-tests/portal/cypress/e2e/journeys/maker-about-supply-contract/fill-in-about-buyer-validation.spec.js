const { contractAboutBuyer, contractAboutFinancial, contractAboutPreview, contract, contractAboutSupplier } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-buyer', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeAboutSupplierSection({
      exporterCompanyName: 'Exporter Company Name',
    });
  });

  beforeEach(() => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);
  });

  it('should trigger all validation errors when a maker picks up a deal in status=Draft', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Buyer name is required');
    contractAboutPreview.expectError('Buyer address line 1 is required');
    contractAboutPreview.expectError('Destination of Goods and Services is required');
  });

  it('should display validation errors on the about-buyer page', () => {
    // prove the errors are on the about-buyer page
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    partials.errorSummaryLinks().should('have.length', 5);
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
