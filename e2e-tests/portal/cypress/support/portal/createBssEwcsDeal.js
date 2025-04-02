const { contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial } = require('../../e2e/pages');
const { submissionDetails } = require('../../fixtures/deal');
const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

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
  cy.completeEligibilityCriteria(dealSubmissionType);
  cy.clickSaveGoBackButton();

  cy.addBondDetails(facilityStage);

  cy.proceedToReviewAndApproval();
};

/**
 * Initiates the creation of a BSS/EWCS deal via the UI.
 * This includes logging in, starting a new submission, and filling bank details.
 * @returns {string} The deal ID of the created deal.
 */
const createBssEwcsDeal = () => {
  cy.login(BANK1_MAKER1);
  cy.startNewSubmission();
  cy.fillBankDetails();
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

export { createBssEwcsDeal, completeBssEwcsDealFields, fillSupplierDetails, fillBuyerDetails, fillFinancialDetails };
