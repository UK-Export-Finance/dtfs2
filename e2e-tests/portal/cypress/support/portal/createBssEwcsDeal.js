const MOCK_USERS = require('../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Fills out the deal details form with the provided information.
 *
 * @param {Object} params - The parameters for filling out the deal details.
 * @param {string} params.dealSubmissionType - The type of DealSubmissionType from ukef common.
 * @param {typeof FACILITY_STAGE.ISSUED | typeof FACILITY_STAGE.UNISSUED} - The stage of the facility.
 * @param {string} params.exporterCompanyName - The name of the exporter company.
 */
const fillOutDealDetails = ({ dealSubmissionType, facilityStage, exporterCompanyName }) => {
  cy.completeAboutSupplierSection({ exporterCompanyName });
  cy.completeAboutBuyerSection();
  cy.completeAboutFinancialSection();
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

export { createBssEwcsDeal, completeBssEwcsDealFields };
