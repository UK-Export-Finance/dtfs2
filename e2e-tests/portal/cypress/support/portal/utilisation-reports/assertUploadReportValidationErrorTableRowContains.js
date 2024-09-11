const { utilisationReportUpload } = require('../../../e2e/pages');

module.exports = ({ tableRowIndex, message, exporter, row, column, entry }) => {
  utilisationReportUpload
    .validationErrorMessage(tableRowIndex)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(message);
    });
  utilisationReportUpload
    .validationErrorExporter(tableRowIndex)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(exporter ?? '-');
    });
  utilisationReportUpload
    .validationErrorRow(tableRowIndex)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(row ?? '-');
    });
  utilisationReportUpload
    .validationErrorColumn(tableRowIndex)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(column ?? '-');
    });
  utilisationReportUpload
    .validationErrorValue(tableRowIndex)
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(entry ?? '');
    });
};
