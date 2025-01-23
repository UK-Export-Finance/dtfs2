import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import pages from '../../../../e2e/pages';

const { premiumPaymentsContent } = pages.utilisationReportPage.tabs;
const { createFeeRecordCorrectionRequestPage } = pages;

/**
 * completeFeeRecordCorrectionRequestForm
 * creates a fee record correction request through the UI
 * logs in, visits the report page, selects the report and creates a fee record correction request
 * ticks boxes for reasons based on provided reasons
 * inputs additional info with provided string
 * @param {FeeRecordEntity} feeRecord - provided fee record
 * @param {String} reportId - report id
 * @param {String[]} reasons - array of strings to select reason for fee record correction
 * @param {String} additionalInfoUserInput - string for additional user input
 */
const completeFeeRecordCorrectionRequestForm = ({
  feeRecord,
  reportId,
  reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
  additionalInfoUserInput,
}) => {
  cy.visit(`utilisation-reports/${reportId}`);

  premiumPaymentsContent.premiumPaymentsTable.checkbox([feeRecord.id], feeRecord.paymentCurrency, feeRecord.status).click();

  premiumPaymentsContent.createRecordCorrectionRequestButton().click();

  reasons.forEach((reason) => {
    createFeeRecordCorrectionRequestPage.reasonCheckbox(reason).check();
  });

  cy.keyboardInput(createFeeRecordCorrectionRequestPage.additionalInfoInput(), additionalInfoUserInput);

  cy.clickContinueButton();
};

export default completeFeeRecordCorrectionRequestForm;
