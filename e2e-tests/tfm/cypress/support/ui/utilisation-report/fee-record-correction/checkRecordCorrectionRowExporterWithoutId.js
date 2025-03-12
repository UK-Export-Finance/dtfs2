import pages from '../../../../e2e/pages';

const { recordCorrectionLogContent } = pages.utilisationReportPage.tabs;

/**
 * Checks value of exporter in record correction log table row
 * Finds row by its index in the table (eg first row is 0)
 * finds exporter cell by its index in the row - index 1
 * asserts value of exporter cell
 * @param {number} row - index of row in record correction log table
 * @param {string} exporter - exporter value to check
 */
const checkRecordCorrectionRowExporterWithoutId = (row, exporter) =>
  cy.assertText(
    recordCorrectionLogContent.recordCorrectionLogTable().find('tr[data-cy^="record-correction-log-table-row-"]').eq(row).find('td').eq(1),
    exporter,
  );

export default checkRecordCorrectionRowExporterWithoutId;
