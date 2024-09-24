import {
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
} from '../../e2e/pages';
import login from './login';
import { submissionDetails } from '../../fixtures/deal';
import MOCK_USERS from '../../../../e2e-fixtures/index';

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Create a BSS/EWCS deal via the UI.
 * @param {Boolean} readyForCheck: Conditionally complete all "maker" required forms
 * @param {Boolean} unissuedFacilities: TBD
 */
const createBssEwcsDeal = ({ readyForCheck = false, unissuedFacilities = false }) => {
  // Log in as BANK1_MAKER1
  login(BANK1_MAKER1);

  // Navigate to create a new BSS deal
  dashboard.createNewSubmission().click();

  // Select BSS scheme
  selectScheme.bss().click();
  cy.clickContinueButton();

  // Select True before starting the application
  beforeYouStart.true().click();
  cy.clickSubmitButton();

  // Fill in bank deal id, bank name
  cy.keyboardInput(bankDetails.bankDealId(), '123');
  cy.keyboardInput(bankDetails.bankDealName(), 'BssDeal');

  cy.clickSubmitButton();

  if (readyForCheck) {
    // Select Supplier Details Link
    contract.aboutSupplierDetailsLink().click();

    // Fill in details about supplier
    contractAboutSupplier.supplierType().select(submissionDetails['supplier-type']);
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

    contract.proceedToReview().click();

    // Submit contract for review
    cy.keyboardInput(contractReadyForReview.comments(), 'Ready for checkers approval');
    contractReadyForReview.readyForCheckersApproval().click();
  }

  if (unissuedFacilities) {
    // created
  }
};

export default createBssEwcsDeal;
