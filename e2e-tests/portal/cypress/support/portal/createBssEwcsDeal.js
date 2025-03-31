import { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';
import { tomorrow, oneYear } from '../../../../e2e-fixtures/dateConstants';

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
  eligibilityDocumentation,
} = require('../../e2e/pages');
const { bank, submissionDetails } = require('../../fixtures/deal');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Fills in the bank details form with predefined values and submits the form.
 *
 * This function performs the following actions:
 * - Inputs the bank deal ID as '123'.
 * - Inputs the bank deal name as 'BssDeal'.
 * - Clicks the submit button to submit the form.
 */
const fillBankDetails = () => {
  cy.keyboardInput(bankDetails.bankDealId(), bank.id);
  cy.keyboardInput(bankDetails.bankDealName(), bank.name);
  cy.clickSubmitButton();
};

/**
 * Fills in the supplier details form in the portal.
 *
 * @param {string} exporterCompanyName - The name of the exporter company. If provided, the form will be filled with this name and related details. If not provided, default submission details will be used.
 */
const fillSupplierDetails = (exporterCompanyName) => {
  contract.aboutSupplierDetailsLink().click();

  if (exporterCompanyName) {
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierName(), exporterCompanyName);
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    cy.keyboardInput(contractAboutSupplier.supplierAddress().line1(), 'Test');
    cy.keyboardInput(contractAboutSupplier.supplierPostCode(), 'AB1 2CD');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('Accommodation and food service activities');
    contractAboutSupplier.industryClass().select('Event catering activities');
  } else {
    contractAboutSupplier.supplierType().select(submissionDetails['supplier-type']);
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
  }
  contractAboutSupplier.smeTypeSmall().click();
  cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
  contractAboutSupplier.notLegallyDistinct().click();
  contractAboutSupplier.nextPage().click();
};

/**
 * Fills in the buyer details form in the portal.
 *
 * This function inputs the buyer's name, address, and destination of goods and services,
 * then navigates to the next page.
 *
 * The following fields are filled:
 * - Buyer Name
 * - Buyer Address (Country, Line 1, Line 2, Line 3, Town, Postcode)
 * - Destination of Goods and Services
 *
 * The function uses Cypress commands to interact with the form elements.
 */
const fillBuyerDetails = () => {
  cy.keyboardInput(contractAboutBuyer.buyerName(), 'Buyer Name');
  contractAboutBuyer.buyerAddress().country().select('United Kingdom');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Line 1');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line2(), 'Line 2');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'Line 3');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'Town');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'AB1 2CD');
  contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
  contractAboutBuyer.nextPage().click();
};

/**
 * Fills in the financial details for a contract.
 *
 * This function sets the supply contract value to 12000, selects the currency as GBP,
 * and then saves the details and navigates back.
 */
const fillFinancialDetails = () => {
  cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
  contractAboutFinancial.supplyContractCurrency().select('GBP');
  contractAboutFinancial.saveAndGoBack().click();
};

/**
 * Fills out the eligibility criteria for a deal submission.
 *
 * @param {import('@ukef/dtfs2-common').DealSubmissionType} dealSubmissionType - The type of deal submission.
 * It can be one of the values from DEAL_SUBMISSION_TYPE.
 *
 * @example
 * fillEligibilityCriteria(DEAL_SUBMISSION_TYPE.AIN);
 */
const fillEligibilityCriteria = (dealSubmissionType) => {
  contract.eligibilityCriteriaLink().click();

  for (let index = 11; index < 19; index += 1) {
    eligibilityCriteria.eligibilityCriteriaTrue(index).click();
  }

  if (dealSubmissionType !== DEAL_SUBMISSION_TYPE.AIN) {
    eligibilityCriteria.eligibilityCriteriaFalse(12).click();
  }

  eligibilityCriteria.nextPageButton().click();
  if (dealSubmissionType === DEAL_SUBMISSION_TYPE.MIA) {
    eligibilityDocumentation.questionnaireFileInputUpload().attachFile('test-upload.txt');
  }
};

/**
 * Initiates a new submission process for a BSS (Business Support Scheme) deal.
 *  * This function performs the following steps:
 * 1. Clicks the button to create a new submission on the dashboard.
 * 2. Selects the BSS scheme.
 * 3. Clicks the continue button.
 * 4. Confirms the "Before You Start" step.
 * 5. Clicks the submit button to finalize the initiation.
 */
const startNewSubmission = () => {
  dashboard.createNewSubmission().click();
  selectScheme.bss().click();
  cy.clickContinueButton();
  beforeYouStart.true().click();
  cy.clickSubmitButton();
};

/**
 * Fills in the details for an unissued bond in the portal.
 *
 * This function selects the bond type as 'Advance payment guarantee',
 * sets the facility stage to 'Unissued', inputs '12' months for the UKEF guarantee,
 * and then submits the form.
 */
const fillUnissuedBondDetails = () => {
  bondDetails.bondTypeInput().select('Advance payment guarantee');
  bondDetails.facilityStageUnissuedInput().click();
  cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
  cy.clickSubmitButton();
};

/**
 * Fills in the issued bond details form with predefined values.
 *
 * This function selects the bond type as 'Advance payment guarantee', sets the facility stage to 'Issued',
 * inputs the requested cover start date, cover end date, and a name, then submits the form.
 *
 */
const fillIssuedBondDetails = () => {
  bondDetails.bondTypeInput().select('Advance payment guarantee');
  bondDetails.facilityStageIssuedInput().click();
  cy.keyboardInput(bondDetails.requestedCoverStartDateDayInput(), tomorrow.day);
  cy.keyboardInput(bondDetails.requestedCoverStartDateMonthInput(), tomorrow.month);
  cy.keyboardInput(bondDetails.requestedCoverStartDateYearInput(), tomorrow.year);
  bondDetails.coverEndDateDayInput().type(oneYear.day);
  bondDetails.coverEndDateMonthInput().type(oneYear.month);
  bondDetails.coverEndDateYearInput().type(oneYear.year);
  cy.keyboardInput(bondDetails.nameInput(), '1234');
  cy.clickSubmitButton();
};

/**
 * Fills in the bond financial details form with predefined values.
 *
 * This function performs the following actions:
 * - Enters '100000' into the facility value input field.
 * - Selects 'Yes' for the currency same as supply contract currency option.
 * - Enters '10' into the risk margin fee input field.
 * - Enters '80' into the covered percentage input field.
 * - Clicks the submit button to submit the form.
 */
const fillBondFinancialDetails = () => {
  cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
  bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
  cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
  cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
  cy.clickSubmitButton();
};

/**
 * Fills in the bond fee details form by selecting the fee type at maturity,
 * setting the day count basis to 365, and then saving the form.
 */
const fillBondFeeDetails = () => {
  bondFeeDetails.feeTypeAtMaturityInput().click();
  bondFeeDetails.dayCountBasis365Input().click();
  cy.clickSaveGoBackButton();
};

/**
 * Adds bond details based on the facility stage.
 *
 * This function clicks the "Add Bond" button and fills in the bond details
 * depending on whether the bond is 'Unissued' or 'Issued'. It also fills in
 * the bond's financial and fee details.
 *
 *  @param {typeof FACILITY_STAGE.ISSUED | typeof FACILITY_STAGE.UNISSUED} facilityStage - The stage of the facility, either 'Unissued' or 'Issued'.

 */
const addBondDetails = (facilityStage) => {
  cy.clickAddBondButton();

  if (facilityStage === FACILITY_STAGE.UNISSUED) {
    fillUnissuedBondDetails();
  } else if (facilityStage === FACILITY_STAGE.ISSUED) {
    fillIssuedBondDetails();
  }

  fillBondFinancialDetails();
  fillBondFeeDetails();
};

/**
 * Proceeds to the review and approval stage of a contract.
 *
 * This function performs the following steps:
 * 1. Verifies that the 'Proceed to Review' button exists.
 * 2. Clicks the 'Proceed to Review' button.
 * 3. Inputs the comment 'Ready for checkers approval' in the contract review comments section.
 * 4. Clicks the 'Ready for Checkers Approval' button to submit the contract for approval.
 */
const proceedToReviewAndApproval = () => {
  contract.proceedToReview().should('exist');
  contract.proceedToReview().click();
  cy.keyboardInput(contractReadyForReview.comments(), 'Ready for checkers approval');
  contractReadyForReview.readyForCheckersApproval().click();
};

/**
 * Fills out the deal details form with the provided information.
 *
 * @param {Object} params - The parameters for filling out the deal details.
 * @param {string} params.dealSubmissionType - The type of DealSubmissionType from ukef common.
 * @param {typeof FACILITY_STAGE.ISSUED | typeof FACILITY_STAGE.UNISSUED} - The stage of the facility.
 * @param {string} params.exporterCompanyName - The name of the exporter company.
 */
const fillOutDealDetails = ({ dealSubmissionType, facilityStage, exporterCompanyName }) => {
  fillSupplierDetails(exporterCompanyName);
  fillBuyerDetails();
  fillFinancialDetails();
  fillEligibilityCriteria(dealSubmissionType);
  cy.clickSaveGoBackButton();

  addBondDetails(facilityStage);

  proceedToReviewAndApproval();
};

/**
 * Initiates the creation of a BSS/EWCS deal via the UI.
 * This includes logging in, starting a new submission, and filling bank details.
 * @returns {string} The deal ID of the created deal.
 */
const createBssEwcsDeal = () => {
  cy.login(BANK1_MAKER1);
  startNewSubmission();
  fillBankDetails();
  // Return DealId from URL
  cy.getDealIdFromUrl(4).then((dealId) => dealId);
};

/**
 * Completes the additional fields for a BSS/EWCS deal.
 * @param {Object} params - The parameters for filling out the deal details.
 * @param {string} params.dealSubmissionType - The type of deal submission.
 * @param {typeof FACILITY_STAGE.ISSUED | typeof FACILITY_STAGE.UNISSUED} params.facilityStage - The stage of the facility.
 * @param {string} params.exporterCompanyName - The name of the exporter company.
 */
const completeBssEwcsDealFields = ({ dealSubmissionType, facilityStage, exporterCompanyName }) => {
  fillOutDealDetails({ dealSubmissionType, facilityStage, exporterCompanyName });
};

export { createBssEwcsDeal, completeBssEwcsDealFields };
