const moment = require('moment');

const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

context('about-buyer', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, MAKER_LOGIN)
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal with the first 2 pages of about-supply-contract complete, and triggers all validation errors on the financial page.', () => {
    cy.login(MAKER_LOGIN);

    contractAboutBuyer.visit(deal);
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supply Contract value is required');
    contractAboutPreview.expectError('Supply Contract currency is required');

    // prove the errors are on the about-financial page
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.expectError('Supply Contract value is required');
    contractAboutFinancial.expectError('Supply Contract currency is required');

    // fill in value + pick currency=GBP to clear validation warnings
    contractAboutFinancial.supplyContractValue().type('123.45');
    contractAboutFinancial.supplyContractCurrency().select('GBP');
    contractAboutFinancial.preview().click();

    // check the errors have been cleared..
    contractAboutPreview.errors().should('not.contain', 'Supply Contract value is required');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract currency is required');

    // switch to non-GBP currency and prove that we now require the exchange-rate + date fields
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractCurrency().select('USD');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');

    // prove 6-decimal-place validation
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionRateToGBP().type('{selectall}{backspace}0.1234567');
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');

    // fix the conversion rate
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionRateToGBP().type('{selectall}{backspace}0.123456');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');

    // fill in the conversion date field by field..
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().day().type('25');
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Month is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Year is required for non-GBP currencies');

    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().month().type('12');
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Month is required for non-GBP currencies');

    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().year().type('2019');
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Year is required for non-GBP currencies');

    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().year().type('{selectall}{backspace}3019');
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be in the future');

    const dateTooFarInThePast = moment().subtract(31, 'days');
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().day().type(`{selectall}{backspace}${moment(dateTooFarInThePast).format('DD')}`);
    contractAboutFinancial.supplyContractConversionDate().month().type(`{selectall}{backspace}${moment(dateTooFarInThePast).format('MM')}`);
    contractAboutFinancial.supplyContractConversionDate().year().type(`{selectall}{backspace}${moment(dateTooFarInThePast).format('YYYY')}`);
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be more than 30 days in the past');


  });
});
