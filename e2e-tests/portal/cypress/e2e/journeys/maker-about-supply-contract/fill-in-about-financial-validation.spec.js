const { CURRENCY } = require('@ukef/dtfs2-common');
const { contractAboutBuyer, contractAboutFinancial, contractAboutPreview, dashboardDeals, contract, contractAboutSupplier } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { thirtyFiveDaysAgo } = require('../../../../../e2e-fixtures/dateConstants');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('about-buyer', () => {
  before(() => {
    cy.createBssEwcsDeal();
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('A maker picks up a deal with the first 2 pages of about-supply-contract complete, and triggers all validation errors on the financial page.', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supply Contract value is required');
    contractAboutPreview.expectError('Supply Contract currency is required');

    // prove the errors are on the about-financial page
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    partials.errorSummaryLinks().should('have.length', 4);
    contractAboutFinancial.expectError('Supply Contract value is required');
    contractAboutFinancial.expectError('Supply Contract currency is required');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');

    // fill in value + pick currency=GBP to clear validation warnings
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '123.45');
    contractAboutFinancial.supplyContractCurrency().select(CURRENCY.GBP);
    contractAboutFinancial.preview().click();

    // check the errors have been cleared..
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutPreview.errors().should('not.exist');
    contractAboutPreview.errors().should('not.exist');

    // switch to non-GBP currency and prove that we now require the exchange-rate + date fields
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.supplyContractCurrency().select(CURRENCY.USD);
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');

    // prove 6-decimal-place validation
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '0.1234567');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');

    // fix the conversion rate
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '0.123456');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion rate must be a number with up to 6 decimal places');

    // fill in the conversion date field by field..
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), '25');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Month is required for non-GBP currencies');
    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date Year is required for non-GBP currencies');

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), '12');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Month is required for non-GBP currencies');

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), '2019');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date is required for non-GBP currencies');
    contractAboutPreview.errors().should('not.contain', 'Supply Contract conversion date Year is required for non-GBP currencies');

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), '3019');
    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be in the future');

    const dateTooFarInThePast = thirtyFiveDaysAgo;

    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), `{selectall}{backspace}${dateTooFarInThePast.day}`);
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), `{selectall}{backspace}${dateTooFarInThePast.month}`);
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), `{selectall}{backspace}${dateTooFarInThePast.year}`);

    contractAboutFinancial.preview().click();

    contractAboutPreview.errors().should('contain', 'Supply Contract conversion date cannot be more than 30 days in the past');
  });
});
