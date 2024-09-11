const { utilisationReportUpload } = require('../../../e2e/pages');

module.exports = ({ tableRowIndex, message, exporter, row, column, entry }) => {
  cy.assertText(utilisationReportUpload.validationErrorMessage(tableRowIndex), message);
  cy.assertText(utilisationReportUpload.validationErrorExporter(tableRowIndex), exporter ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorRow(tableRowIndex), row ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorColumn(tableRowIndex), column ?? '-');
  cy.assertText(utilisationReportUpload.validationErrorValue(tableRowIndex), entry ?? '');
};
