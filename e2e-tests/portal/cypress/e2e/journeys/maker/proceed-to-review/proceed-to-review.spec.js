const {
  bondDetails,
  bondFinancialDetails,
  bondFeeDetails,
  contract,
  contractAboutBuyer,
  contractAboutFinancial,
  contractAboutSupplier,
  dashboardDeals,
  eligibilityCriteria,
} = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('../../maker-bond/fill-bond-forms');
const fillLoanForm = require('../../maker-loan/fill-loan-forms');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Ensure proceed to review button is only visible once facilities are in eligible for submission', () => {
  before(() => {
    cy.createBssEwcsDeal({});
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Add an un-issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    // Ensure proceed to review button does not exist
    contract.proceedToReview().should('not.exist');

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('12345678', { delay: 0 });
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    contractAboutSupplier.supplyContractDescription().type('Supply Contract Description', { delay: 0 });
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    contractAboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
    contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    contractAboutBuyer.buyerAddress().line1().type('Line 1', { delay: 0 });
    contractAboutBuyer.buyerAddress().line2().type('Line 2', { delay: 0 });
    contractAboutBuyer.buyerAddress().line3().type('Line 3', { delay: 0 });
    contractAboutBuyer.buyerAddress().town().type('Town', { delay: 0 });
    contractAboutBuyer.buyerAddress().postcode().type('AB1 2CD', { delay: 0 });
    contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    contractAboutBuyer.nextPage().click();

    // Fill in financial details
    contractAboutFinancial.supplyContractValue().type('12000', { delay: 0 });
    contractAboutFinancial.supplyContractCurrency().select('GBP - UK Sterling');
    contractAboutFinancial.saveAndGoBack().click();

    contract.eligibilityCriteriaLink().click();

    // Select automatic cover details
    eligibilityCriteria.eligibilityCriteriaTrue(11).click();
    eligibilityCriteria.eligibilityCriteriaTrue(12).click();
    eligibilityCriteria.eligibilityCriteriaTrue(13).click();
    eligibilityCriteria.eligibilityCriteriaTrue(14).click();
    eligibilityCriteria.eligibilityCriteriaTrue(15).click();
    eligibilityCriteria.eligibilityCriteriaTrue(16).click();
    eligibilityCriteria.eligibilityCriteriaTrue(17).click();
    eligibilityCriteria.eligibilityCriteriaTrue(18).click();
    eligibilityCriteria.nextPageButton().click();

    cy.clickSaveGoBackButton();

    cy.clickAddBondButton();

    // Fill in bond details
    bondDetails.bondTypeInput().select('Advance payment guarantee');
    bondDetails.facilityStageUnissuedInput().click();
    bondDetails.ukefGuaranteeInMonthsInput().type('12', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond financial details
    bondFinancialDetails.facilityValueInput().type('100000', { delay: 0 });
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    bondFinancialDetails.riskMarginFeeInput().type('10', { delay: 0 });
    bondFinancialDetails.coveredPercentageInput().type('80', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond fee details
    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    contract.proceedToReview().should('exist');
  });

  it('Add an issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().clear().type('04301762', { delay: 0 });
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    contractAboutSupplier.supplyContractDescription().type('Supply Contract Description', { delay: 0 });
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    contractAboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
    contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    contractAboutBuyer.buyerAddress().line1().type('Line 1', { delay: 0 });
    contractAboutBuyer.buyerAddress().line2().type('Line 2', { delay: 0 });
    contractAboutBuyer.buyerAddress().line3().type('Line 3', { delay: 0 });
    contractAboutBuyer.buyerAddress().town().type('Town', { delay: 0 });
    contractAboutBuyer.buyerAddress().postcode().type('AB1 2CD', { delay: 0 });
    contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    contractAboutBuyer.nextPage().click();

    // Fill in financial details
    contractAboutFinancial.supplyContractValue().type('12000', { delay: 0 });
    contractAboutFinancial.supplyContractCurrency().select('GBP - UK Sterling');
    contractAboutFinancial.saveAndGoBack().click();

    contract.eligibilityCriteriaLink().click();

    // Select automatic cover details
    eligibilityCriteria.eligibilityCriteriaTrue(11).click();
    eligibilityCriteria.eligibilityCriteriaTrue(12).click();
    eligibilityCriteria.eligibilityCriteriaTrue(13).click();
    eligibilityCriteria.eligibilityCriteriaTrue(14).click();
    eligibilityCriteria.eligibilityCriteriaTrue(15).click();
    eligibilityCriteria.eligibilityCriteriaTrue(16).click();
    eligibilityCriteria.eligibilityCriteriaTrue(17).click();
    eligibilityCriteria.eligibilityCriteriaTrue(18).click();
    eligibilityCriteria.nextPageButton().click();

    cy.clickSaveGoBackButton();

    cy.clickAddBondButton();

    // Fill in bond details
    bondDetails.bondTypeInput().select('Advance payment guarantee');
    bondDetails.facilityStageUnissuedInput().click();
    bondDetails.ukefGuaranteeInMonthsInput().type('12', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond financial details
    bondFinancialDetails.facilityValueInput().type('100000', { delay: 0 });
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    bondFinancialDetails.riskMarginFeeInput().type('10', { delay: 0 });
    bondFinancialDetails.coveredPercentageInput().type('80', { delay: 0 });
    cy.clickSubmitButton();

    // Fill in bond fee details
    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    contract.proceedToReview().should('exist');
  });

  it('Add a partial issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    // Ensure facility stage is `Incomplete`
    contract.loansTransactionsTableRows().each((row, index) => {
      const loanId = row.attr('data-cy').split('-')[1];
      const loan = contract.loansTransactionsTable.row(loanId);
      const status = index === 2 ? 'Incomplete' : 'Complete';
      loan.loanStatus().contains(status);
    });
  });

  it('Ensure proceed to review button is not visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    // Proceed to review button
    contract.proceedToReview().should('not.exist');
  });
});
