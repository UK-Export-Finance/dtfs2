const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('../../maker-bond/fill-bond-forms');
const fillLoanForm = require('../../maker-loan/fill-loan-forms');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Ensure proceed to review button is only visible once facilities are in eligible for submission', () => {
  before(() => {
    cy.createBssDeal({});
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Add an un-issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Ensure proceed to review button does not exist
    pages.contract.proceedToReview().should('not.exist');

    // Add bond
    cy.clickAddBondButton();

    // Bond details
    fillBondForm.details.facilityStageUnissued();
    cy.clickSubmitButton();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillBondForm.feeDetails();
    cy.clickSubmitButton();
  });

  it('Add an un-issued (conditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    cy.clickSubmitButton();

    // Financial details
    fillLoanForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();
  });

  it('Ensure proceed to review button is visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();
    pages.contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    pages.contractAboutSupplier.supplierType().select('Exporter');
    pages.contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('12345678', { delay: 0 });
    pages.contractAboutSupplier.supplierSearchCompaniesHouse().click();
    pages.contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    pages.contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    pages.contractAboutSupplier.smeTypeSmall().click();
    pages.contractAboutSupplier.supplyContractDescription().type('Supply Contract Description', { delay: 0 });
    pages.contractAboutSupplier.notLegallyDistinct().click();
    pages.contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    pages.contractAboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    pages.contractAboutBuyer.buyerAddress().line1().type('Line 1', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().line2().type('Line 2', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().line3().type('Line 3', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().town().type('Town', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().postcode().type('AB1 2CD', { delay: 0 });
    pages.contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    pages.contractAboutBuyer.nextPage().click();

    // Fill in financial details
    pages.contractAboutFinancial.supplyContractValue().type('12000', { delay: 0 });
    pages.contractAboutFinancial.supplyContractCurrency().select('GBP - UK Sterling');
    pages.contractAboutFinancial.saveAndGoBack().click();

    pages.contract.eligibilityCriteriaLink().click();

    // Select automatic cover details
    pages.eligibilityCriteria.eligibilityCriteriaTrue(11).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(12).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(13).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(14).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(15).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(16).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(17).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(18).click();
    pages.eligibilityCriteria.nextPageButton().click();

    cy.clickSaveGoBackButton();

    cy.clickAddBondButton();

    // Fill in bond details
    pages.bondDetails.bondTypeInput().select('Advance payment guarantee');
    pages.bondDetails.facilityStageUnissuedInput().click();
    pages.bondDetails.ukefGuaranteeInMonthsInput().type('12', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond financial details
    pages.bondFinancialDetails.facilityValueInput().type('100000', { delay: 0 });
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    pages.bondFinancialDetails.riskMarginFeeInput().type('10', { delay: 0 });
    pages.bondFinancialDetails.coveredPercentageInput().type('80', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond fee details
    pages.bondFeeDetails.feeTypeAtMaturityInput().click();
    pages.bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    pages.contract.proceedToReview().should('exist');
  });

  it('Add an issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Add bond
    cy.clickAddBondButton();

    // Bond details
    fillBondForm.details.facilityStageIssued();
    cy.clickSubmitButton();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillBondForm.feeDetails();
    cy.clickSubmitButton();
  });

  it('Add an issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    cy.clickSubmitButton();

    // Financial details
    fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();
  });

  it('Ensure proceed to review button is visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();
    pages.contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    pages.contractAboutSupplier.supplierType().select('Exporter');
    pages.contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().clear().type('04301762', { delay: 0 });
    pages.contractAboutSupplier.supplierSearchCompaniesHouse().click();
    pages.contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    pages.contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    pages.contractAboutSupplier.smeTypeSmall().click();
    pages.contractAboutSupplier.supplyContractDescription().type('Supply Contract Description', { delay: 0 });
    pages.contractAboutSupplier.notLegallyDistinct().click();
    pages.contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    pages.contractAboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    pages.contractAboutBuyer.buyerAddress().line1().type('Line 1', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().line2().type('Line 2', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().line3().type('Line 3', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().town().type('Town', { delay: 0 });
    pages.contractAboutBuyer.buyerAddress().postcode().type('AB1 2CD', { delay: 0 });
    pages.contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    pages.contractAboutBuyer.nextPage().click();

    // Fill in financial details
    pages.contractAboutFinancial.supplyContractValue().type('12000', { delay: 0 });
    pages.contractAboutFinancial.supplyContractCurrency().select('GBP - UK Sterling');
    pages.contractAboutFinancial.saveAndGoBack().click();

    pages.contract.eligibilityCriteriaLink().click();

    // Select automatic cover details
    pages.eligibilityCriteria.eligibilityCriteriaTrue(11).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(12).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(13).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(14).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(15).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(16).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(17).click();
    pages.eligibilityCriteria.eligibilityCriteriaTrue(18).click();
    pages.eligibilityCriteria.nextPageButton().click();

    cy.clickSaveGoBackButton();

    cy.clickAddBondButton();

    // Fill in bond details
    pages.bondDetails.bondTypeInput().select('Advance payment guarantee');
    pages.bondDetails.facilityStageUnissuedInput().click();
    pages.bondDetails.ukefGuaranteeInMonthsInput().type('12', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond financial details
    pages.bondFinancialDetails.facilityValueInput().type('100000', { delay: 0 });
    pages.bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    pages.bondFinancialDetails.riskMarginFeeInput().type('10', { delay: 0 });
    pages.bondFinancialDetails.coveredPercentageInput().type('80', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond fee details
    pages.bondFeeDetails.feeTypeAtMaturityInput().click();
    pages.bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    pages.contract.proceedToReview().should('exist');
  });

  it('Add a partial issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    cy.clickSubmitButton();

    // Financial details - Do not fill in
    cy.clickSubmitButton();

    // Fee details
    cy.assertText(partials.taskListHeader.itemStatus('loan-financial-details'), 'Incomplete');

    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Ensure facility stage is `Incomplete`
    pages.contract.loansTransactionsTableRows().each((row, index) => {
      const loanId = row.attr('data-cy').split('-')[1];
      const loan = pages.contract.loansTransactionsTable.row(loanId);
      const status = index === 2 ? 'Incomplete' : 'Complete';
      loan.loanStatus().contains(status);
    });
  });

  it('Ensure proceed to review button is not visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.dashboardDeals.visit();
    pages.dashboardDeals.rowIndex.link().click();

    // Proceed to review button
    pages.contract.proceedToReview().should('not.exist');
  });
});
