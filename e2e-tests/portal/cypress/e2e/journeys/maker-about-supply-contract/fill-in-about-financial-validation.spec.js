const { CURRENCY } = require('@ukef/dtfs2-common');
const { contractAboutBuyer, contractAboutFinancial, contractAboutPreview, contractAboutSupplier, contract } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');
const { thirtyFiveDaysAgo } = require('../../../../../e2e-fixtures/dateConstants');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('about-buyer', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  beforeEach(() => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('should navigate to the about financial page and trigger validation errors', () => {
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Supply Contract value is required');
    contractAboutPreview.expectError('Supply Contract currency is required');
  });

  it('should display validation errors on the about-financial page', () => {
    partials.errorSummaryLinks().should('have.length', 4);
    contractAboutFinancial.expectError('Supply Contract value is required');
    contractAboutFinancial.expectError('Supply Contract currency is required');
    contractAboutFinancial.expectError('Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutFinancial.expectError('Supply Contract conversion date is required for non-GBP currencies');
  });

  it('should not display validation errors when GBP currency is selected', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '123.45');
    contractAboutFinancial.supplyContractCurrency().select(CURRENCY.GBP);
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Supply Contract value is required').should('not.exist');
    contractAboutPreview.expectError('Supply Contract currency is required').should('not.exist');

    contractAboutPreview.expectError('Supply Contract conversion date is required for non-GBP currencies').should('not.exist');
    contractAboutPreview.expectError('Supply Contract conversion date is required for non-GBP currencies').should('not.exist');
  });

  it('should display validation errors when non-GBP currency is selected', () => {
    contractAboutFinancial.supplyContractCurrency().select(CURRENCY.USD);
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');
  });

  it('should display validation error for 6-decimal-place conversion rate', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '0.1234567');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');
  });

  it('should clear validation error for conversion rate', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '0.123456');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');
  });

  it('should display validation errors for conversion date', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), '25');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Month is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Year is required for non-GBP currencies');
  });

  it('should clear validation error for conversion date month', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), '12');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Month is required for non-GBP currencies');
  });

  it('should clear validation error for conversion date year', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), '2019');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Year is required for non-GBP currencies');
  });

  it('should display validation error for conversion date in the future', () => {
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), '3019');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be in the future');
  });

  it('should display validation error for conversion date more than 30 days in the past', () => {
    const dateTooFarInThePast = thirtyFiveDaysAgo;
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), dateTooFarInThePast.day);
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), dateTooFarInThePast.month);
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), dateTooFarInThePast.year);

    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be more than 30 days in the past');
  });
});
