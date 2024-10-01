const {
  dashboard,
  selectScheme,
  beforeYouStart,
  bankDetails,
  contract,
  eligibilityCriteria,
  bondDetails,
  bondFinancialDetails,
  bondFeeDetails,
  contractReadyForReview,
  contractAboutSupplier,
  contractAboutBuyer,
  contractAboutFinancial,
} = require('../../e2e/pages');
const { submissionDetails } = require('../../fixtures/deal');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Create a BSS/EWCS deal via the UI.
 * @param {Boolean} readyForCheck: Conditionally complete all "maker" required forms
 */
const createBssEwcsDeal = ({ readyForCheck = false }) => {
  cy.login(BANK1_MAKER1);

  dashboard.createNewSubmission().click();

  // select BSS scheme
  selectScheme.bss().click();
  cy.clickContinueButton();

  // select True before starting the application
  beforeYouStart.true().click();
  cy.clickSubmitButton();

  // complete "bank details"
  cy.keyboardInput(bankDetails.bankDealId(), '123');
  cy.keyboardInput(bankDetails.bankDealName(), 'BssDeal');

  cy.clickSubmitButton();

  if (readyForCheck) {
    contract.aboutSupplierDetailsLink().click();

    // complete "about supplier"
    contractAboutSupplier.supplierType().select(submissionDetails['supplier-type']);
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    // complete "about buyer"
    cy.keyboardInput(contractAboutBuyer.buyerName(), 'Buyer Name');
    contractAboutBuyer.buyerAddress().country().select('United Kingdom');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Line 1');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line2(), 'Line 2');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'Line 3');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'Town');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'AB1 2CD');
    contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
    contractAboutBuyer.nextPage().click();

    // complete "financial details"
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
    contractAboutFinancial.supplyContractCurrency().select('GBP');
    contractAboutFinancial.saveAndGoBack().click();

    contract.eligibilityCriteriaLink().click();

    // complete "eligibility criteria"
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

    // complete "bond details"
    bondDetails.bondTypeInput().select('Advance payment guarantee');
    bondDetails.facilityStageUnissuedInput().click();
    cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
    cy.clickSubmitButton();

    // complete "bond financial details"
    cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
    cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
    cy.clickSubmitButton();

    // complete "bond fee details"
    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    contract.proceedToReview().click();

    // submit to checker
    cy.keyboardInput(contractReadyForReview.comments(), 'Ready for checkers approval');
    contractReadyForReview.readyForCheckersApproval().click();
  }
};

export default createBssEwcsDeal;
