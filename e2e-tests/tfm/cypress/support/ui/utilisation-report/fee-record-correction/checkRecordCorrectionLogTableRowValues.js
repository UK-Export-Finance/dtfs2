import pages from '../../../../e2e/pages';

const { recordCorrectionLogContent } = pages.utilisationReportPage.tabs;

const { table } = recordCorrectionLogContent;

/**
 * checkRecordCorrectionLogTableRowValues
 * checks the values of a row in the fee record correction log table
 * from the fee record and provided values
 * @param {FeeRecordEntity} feeRecord - provided fee record
 * @param {string} reasons - provided string with fee record correction reasons
 * @param {string} dateSent - provided string with the date the fee record correction was requested
 * @param {string} correctRecord - provided string for the correct record
 * @param {string} oldRecord - provided string for the old record with the values from the existing fee record
 * @param {string} status - provided string with the status of the fee record correction
 */
const checkRecordCorrectionLogTableRowValues = ({ feeRecord, reasons, dateSent, correctRecord, oldRecord, status }) => {
  const correctionId = feeRecord.corrections[0].id;
  const row = table.row(correctionId);

  cy.assertText(row.dateSent(), dateSent);
  cy.assertText(row.exporter(), feeRecord.exporter);
  cy.assertText(row.reasons(), reasons);
  cy.assertText(row.correctRecord(), correctRecord);
  cy.assertText(row.oldRecord(), oldRecord);
  cy.assertText(row.status(), status);
};

export default checkRecordCorrectionLogTableRowValues;
