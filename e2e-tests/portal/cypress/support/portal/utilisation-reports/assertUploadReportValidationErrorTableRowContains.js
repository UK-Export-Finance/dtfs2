const { utilisationReportUpload } = require('../../../e2e/pages');

/**
 * @typedef {Object} ValidationRowAssertionParams
 * @property {number} tableRowIndex - The index of the row to assert on within the table (one-indexed)
 * @property {string} message - The value expected to be in the message column
 * @property {string} [exporter] - The value expected to be in the exporter column
 * @property {string} [row] - The value expected to be in the row column
 * @property {string} [column] - The value expected to be in the column column
 * @property {string} [entry] - The value expected to be in the entry column
 */

/**
 * Asserts that the given table row of the check the report page validation table
 * contains the given message, exporter, row, column and entry.
 * If any of the optional fields (exporter, row, column or entry) are not provided,
 * then we assert the correct empty state is being displayed for those columns.
 * @param {ValidationRowAssertionParams} params
 */
module.exports = ({ tableRowIndex, message, exporter, row, column, entry }) => {
  cy.assertText(utilisationReportUpload.validationErrorMessage(tableRowIndex), message);
  cy.assertText(utilisationReportUpload.validationErrorExporter(tableRowIndex), exporter ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorRow(tableRowIndex), row ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorColumn(tableRowIndex), column ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorValue(tableRowIndex), entry ?? '');
};
