const {
  contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');
const partials = require('../../../partials');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

// test data we want to set up + work with..
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');
const { nowPlusDays } = require('../../../../support/utils/dateFuncs');

context('about-buyer', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
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
    partials.errorSummary.errorSummaryLinks().should('have.length', 2);
    contractAboutFinancial.expectError('Supply Contract value is required');
    contractAboutFinancial.expectError('Supply Contract currency is required');

    // fill in value + pick currency=GBP to clear validation warnings
    contractAboutFinancial.supplyContractValue().type('123.45');
    contractAboutFinancial.supplyContractCurrency().select('GBP');
    contractAboutFinancial.preview().click();

    // check the errors have been cleared..
    contractAboutPreview.errors().should('not.exist');
    contractAboutPreview.errors().should('not.exist');

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

    const dateTooFarInThePast = nowPlusDays(-31);
    contractAboutFinancial.visit(deal);
    contractAboutFinancial.supplyContractConversionDate().day().type(`{selectall}{backspace}${dateTooFarInThePast.getDate()}`);
    contractAboutFinancial.supplyContractConversionDate().month().type(`{selectall}{backspace}${dateTooFarInThePast.getMonth() + 1}`);
    contractAboutFinancial.supplyContractConversionDate().year().type(`{selectall}{backspace}${dateTooFarInThePast.getFullYear()}`);
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be more than 30 days in the past');
  });
});
