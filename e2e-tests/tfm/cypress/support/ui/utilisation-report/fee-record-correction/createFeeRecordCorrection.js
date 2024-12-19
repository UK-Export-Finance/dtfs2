import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import pages from '../../../../e2e/pages';
import USERS from '../../../../fixtures/users';

const { premiumPaymentsTab } = pages.utilisationReportPage;
const { createFeeRecordCorrectionRequestPage } = pages;

/**
 * createFeeRecordCorrection
 * creates a fee record correction request through the UI
 * logs in, visits the report page, selects the report and creates a fee record correction request
 * ticks boxes for reasons based on provided reasons
 * inputs additional info with provided string
 * if shouldSubmitFeeRecordCorrection is set to true, submits the feeRecordCorrection request
 * @param {Boolean} shouldSubmitFeeRecordCorrectionRequest - if fee record correction request should be submitted beyond check information page
 * @param {FeeRecordEntity} feeRecord - provided fee record
 * @param {String} reportId - report id
 * @param {String[]} reasons - array of strings to select reason for fee record correction
 * @param {String} additionalInfoUserInput - string for additional user input
 */
const createFeeRecordCorrection = ({
  shouldSubmitFeeRecordCorrectionRequest = true,
  feeRecord,
  reportId,
  reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
  additionalInfoUserInput,
}) => {
  cy.login(USERS.PDC_RECONCILE);

  cy.visit(`utilisation-reports/${reportId}`);

  premiumPaymentsTab.premiumPaymentsTable.checkbox([feeRecord.id], feeRecord.paymentCurrency, feeRecord.status).click();

  premiumPaymentsTab.createRecordCorrectionRequestButton().click();

  reasons.forEach((reason) => {
    createFeeRecordCorrectionRequestPage.reasonCheckbox(reason).check();
  });

  cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);

  cy.clickContinueButton();

  if (shouldSubmitFeeRecordCorrectionRequest) {
    cy.clickContinueButton();
  }
};

export default createFeeRecordCorrection;
