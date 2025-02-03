import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';

/**
 * completeAndSubmitFeeRecordCorrectionRequestForm
 * creates a fee record correction request through the UI
 * logs in, visits the report page, selects the report and creates a fee record correction request
 * ticks boxes for reasons based on provided reasons
 * inputs additional info with provided string
 * submits the feeRecordCorrection request
 * @param {FeeRecordEntity} feeRecord - provided fee record
 * @param {String} reportId - report id
 * @param {String[]} reasons - array of strings to select reason for fee record correction
 * @param {String} additionalInfoUserInput - string for additional user input
 */
const completeAndSubmitFeeRecordCorrectionRequestForm = ({
  feeRecord,
  reportId,
  reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
  additionalInfoUserInput,
}) => {
  cy.completeFeeRecordCorrectionRequestForm({ feeRecord, reportId, reasons, additionalInfoUserInput });

  cy.clickContinueButton();
};

export default completeAndSubmitFeeRecordCorrectionRequestForm;
