// This file is used to create a BSS application that is ready for check
const {
  dashboard,
  selectScheme,
  beforeYouStart,
  bankDetails,
  contract,
  eligibilityCriteria,
  eligibilityPreview,
  bondDetails,
  bondFinancialDetails,
  bondFeeDetails,
  contractReadyForReview,
} = require('../../e2e/pages');
const { aboutSupplier, aboutBuyer, aboutFinancial } = require('../../e2e/pages/contract');
const login = require('./login');
const MOCK_USERS = require('../../../../e2e-fixtures/index');

const { BANK1_MAKER1 } = MOCK_USERS;

/** * Create a BSS/EWCS deal via the UI with a "ready for check" status */

const createBssDealReadyForCheck = () => {
  // Log in as BANK1_MAKER1
  login(BANK1_MAKER1);

  // Navigate to create a new BSS deal
  dashboard.createNewSubmission().click();

  // Select BSS scheme
  selectScheme.bss().click();
  selectScheme.continue().click();

  // Select True before starting the application
  beforeYouStart.true().click();
  beforeYouStart.submit().click();

  // Fill in bank deal id, bank name
  bankDetails.bankDealId().type('12345678', { delay: 0 });
  bankDetails.bankDealName().type('BSS Deal', { delay: 0 });
  bankDetails.submit().click();

  // Select Supplier Details Link
  contract.aboutSupplierDetailsLink().click();

  // Fill in details about supplier
  aboutSupplier.supplierType().select('Exporter');
  aboutSupplier.supplierCompaniesHouseRegistrationNumber().type('12345678', { delay: 0 });
  aboutSupplier.supplierSearchCompaniesHouse().click();
  aboutSupplier.supplierAddress().country().select('United Kingdom');
  aboutSupplier.supplierCorrespondenceAddressSame().click();
  aboutSupplier.smeTypeSmall().click();
  aboutSupplier.supplyContractDescription().type('Supply Contract Description', { delay: 0 });
  aboutSupplier.notLegallyDistinct().click();
  aboutSupplier.nextPage().click();

  // Fill in details about buyer
  aboutBuyer.buyerName().type('Buyer Name', { delay: 0 });
  aboutBuyer.buyerAddress().country().select('United Kingdom');
  aboutBuyer.buyerAddress().line1().type('Line 1', { delay: 0 });
  aboutBuyer.buyerAddress().line2().type('Line 2', { delay: 0 });
  aboutBuyer.buyerAddress().line3().type('Line 3', { delay: 0 });
  aboutBuyer.buyerAddress().town().type('Town', { delay: 0 });
  aboutBuyer.buyerAddress().postcode().type('AB1 2CD', { delay: 0 });
  aboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
  aboutBuyer.nextPage().click();

  // Fill in financial details
  aboutFinancial.supplyContractValue().type('100000', { delay: 0 });
  aboutFinancial.supplyContractCurrency().select('GBP - UK Sterling');
  aboutFinancial.saveAndGoBack().click();

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

  eligibilityPreview.saveGoBackButton().click();

  contract.addBondButton().click();

  // Fill in bond details
  bondDetails.bondTypeInput().select('Advance payment guarantee');
  bondDetails.facilityStageUnissuedInput().click();
  bondDetails.ukefGuaranteeInMonthsInput().type('12', { delay: 0 });
  bondDetails.submit().click();

  // Fill in bond financial details
  bondFinancialDetails.facilityValueInput().type('100000', { delay: 0 });
  bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
  bondFinancialDetails.riskMarginFeeInput().type('10', { delay: 0 });
  bondFinancialDetails.coveredPercentageInput().type('80', { delay: 0 });
  bondFinancialDetails.submit().click();

  // Fill in bond fee details
  bondFeeDetails.feeTypeAtMaturityInput().click();
  bondFeeDetails.dayCountBasis365Input().click();
  bondFeeDetails.saveGoBackButton().click();

  contract.proceedToReview().click();

  // Submit contract for review
  contractReadyForReview.comments().type('Ready for checkers approval', { delay: 0 });
  contractReadyForReview.readyForCheckersApproval().click();
};

module.exports = createBssDealReadyForCheck;
