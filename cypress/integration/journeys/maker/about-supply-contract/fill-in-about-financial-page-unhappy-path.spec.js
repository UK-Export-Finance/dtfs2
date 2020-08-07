const moment = require('moment');

const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

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
    cy.insertOneDeal(aDealWithAboutBuyerComplete, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(MAKER_LOGIN);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nav().aboutBuyerLink().click();
    contractAboutBuyer.nav().aboutFinancialLink().click();

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10,000');
    contractAboutFinancial.supplyContractCurrency().select('USD');
    contractAboutFinancial.supplyContractConversionRateToGBP().type('1.123456');

    const today = moment();
    contractAboutFinancial.supplyContractConversionDate().day().type(`${moment(today).format('DD')}`);
    contractAboutFinancial.supplyContractConversionDate().month().type(`${moment(today).format('MM')}`);
    contractAboutFinancial.supplyContractConversionDate().year().type(`${moment(today).format('YYYY')}`);

    contractAboutFinancial.saveAndGoBack().click();

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');
  });
});
