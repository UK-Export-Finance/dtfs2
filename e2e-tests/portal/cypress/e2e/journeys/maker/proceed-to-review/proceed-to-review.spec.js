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
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

    contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    contractAboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
    contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Line 1');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line2(), 'Line 2');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'Line 3');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'Town');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'AB1 2CD');
    contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    contractAboutBuyer.nextPage().click();

    // Fill in financial details
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
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
    cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
    cy.clickSubmitButton();

    // Fill in bond financial details
    cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
    cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
    cy.clickSubmitButton();

    // Fill in bond fee details
    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    contract.proceedToReview().should('exist');
  });

  it('Add an issued bond', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

    contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    // Fill in details about buyer
    cy.keyboardInput(contractAboutBuyer.buyerName(), 'Buyer Name');
    contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Line 1');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line2(), 'Line 2');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'Line 3');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'Town');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'AB1 2CD');
    contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    contractAboutBuyer.nextPage().click();

    // Fill in financial details
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
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
    cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
    cy.clickSubmitButton();

    // Fill in bond financial details
    cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
    cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
    cy.clickSubmitButton();

    // Fill in bond fee details
    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    // Proceed to review button
    contract.proceedToReview().should('exist');
  });

  it('Add a partial issued (unconditional) loan', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

    // Proceed to review button
    contract.proceedToReview().should('not.exist');
  });
});
