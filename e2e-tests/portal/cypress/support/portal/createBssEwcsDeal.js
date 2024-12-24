import { add } from 'date-fns';

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
const { submissionDetails } = require('../../fixtures/deal');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

const tomorrow = add(new Date(), { days: 1 });
const startDate = {
  day: tomorrow.getDate(),
  month: tomorrow.getMonth(),
  year: tomorrow.getFullYear(),
};

const endDate = {
  day: tomorrow.getDate(),
  month: tomorrow.getMonth(),
  year: tomorrow.getFullYear() + 1,
};

/**
 * Create a BSS/EWCS deal via the UI.
 * * @param {Object} createBssEwcsDealParams
 * @param {Boolean} readyForCheck: Conditionally complete all "maker" required forms
 * * @param {import('@ukef/dtfs2-common').DealType} createBssEwcsDealParams.dealType - ....
 */

const fillBankDetails = () => {
  cy.keyboardInput(bankDetails.bankDealId(), '123');
  cy.keyboardInput(bankDetails.bankDealName(), 'BssDeal');
  cy.clickSubmitButton();
};

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
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();
  } else {
    contractAboutSupplier.supplierType().select(submissionDetails['supplier-type']);
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();
  }
};

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

const fillFinancialDetails = () => {
  cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '12000');
  contractAboutFinancial.supplyContractCurrency().select('GBP');
  contractAboutFinancial.saveAndGoBack().click();
};

const fillEligibilityCriteria = (dealSubmissionType) => {
  contract.eligibilityCriteriaLink().click();

  const criteria = dealSubmissionType === 'BSS/EWCS' ? [true, false, true, true, true, true, true, true] : [true, true, true, true, true, true, true, true];

  criteria.forEach((value, index) => {
    if (value) {
      eligibilityCriteria.eligibilityCriteriaTrue(index + 11).click();
    } else {
      eligibilityCriteria.eligibilityCriteriaFalse(index + 11).click();
    }
  });

  eligibilityCriteria.nextPageButton().click();
  if (dealSubmissionType === 'BSS/EWCS') {
    eligibilityDocumentation.questionnaireFileInputUpload().attachFile('test-upload.txt');
  }
};

const createBssEwcsDeal = ({ fillOutAllFields = false, dealSubmissionType, facilityStage, exporterCompanyName } = {}) => {
  cy.login(BANK1_MAKER1);

  dashboard.createNewSubmission().click();
  selectScheme.bss().click();
  cy.clickContinueButton();
  beforeYouStart.true().click();
  cy.clickSubmitButton();

  fillBankDetails();

  if (fillOutAllFields) {
    fillSupplierDetails(exporterCompanyName);
    fillBuyerDetails();
    fillFinancialDetails();
    fillEligibilityCriteria(dealSubmissionType);
    cy.clickSaveGoBackButton();

    cy.clickAddBondButton();

    if (facilityStage === 'Unissued') {
      bondDetails.bondTypeInput().select('Advance payment guarantee');
      bondDetails.facilityStageUnissuedInput().click();
      cy.keyboardInput(bondDetails.ukefGuaranteeInMonthsInput(), '12');
      cy.clickSubmitButton();
    } else if (facilityStage === 'Issued') {
      bondDetails.bondTypeInput().select('Advance payment guarantee');
      bondDetails.facilityStageIssuedInput().click();
      cy.keyboardInput(bondDetails.requestedCoverStartDateDayInput(), startDate.day);
      cy.keyboardInput(bondDetails.requestedCoverStartDateMonthInput(), startDate.month + 1);
      cy.keyboardInput(bondDetails.requestedCoverStartDateYearInput(), startDate.year);
      bondDetails.coverEndDateDayInput().type(endDate.day);
      bondDetails.coverEndDateMonthInput().type(endDate.month);
      bondDetails.coverEndDateYearInput().type(endDate.year);
      cy.keyboardInput(bondDetails.nameInput(), '1234');
      cy.clickSubmitButton();
    }

    cy.keyboardInput(bondFinancialDetails.facilityValueInput(), '100000');
    bondFinancialDetails.currencySameAsSupplyContractCurrencyYesInput().click();
    cy.keyboardInput(bondFinancialDetails.riskMarginFeeInput(), '10');
    cy.keyboardInput(bondFinancialDetails.coveredPercentageInput(), '80');
    cy.clickSubmitButton();

    bondFeeDetails.feeTypeAtMaturityInput().click();
    bondFeeDetails.dayCountBasis365Input().click();
    cy.clickSaveGoBackButton();

    contract.proceedToReview().should('exist');
    contract.proceedToReview().click();

    cy.keyboardInput(contractReadyForReview.comments(), 'Ready for checkers approval');
    contractReadyForReview.readyForCheckersApproval().click();
  }
};

export default createBssEwcsDeal;
