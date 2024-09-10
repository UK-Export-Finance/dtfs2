const page = {
  utilisationReportFileInput: () => cy.get('[data-cy="utilisation-report-file-upload"]'),
  utilisationReportFileInputErrorMessage: () => cy.get('[data-cy="utilisation-report-file-upload-error-message"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  checkReportTitle: () => cy.get('[data-cy="check-the-report-title"]'),
  validationErrorTable: () => cy.get('[data-cy="validation-errors-table"]'),
  validationErrorTableRows: () => cy.get('[data-cy="validation-errors-table-row"]'),
  validationErrorMessage: (errorIndex) => cy.get(`[data-cy="validation-errors-table-row"] [data-cy="message-${errorIndex}"]`),
  validationErrorExporter: (errorIndex) => cy.get(`[data-cy="validation-errors-table-row"] [data-cy="exporter-${errorIndex}"]`),
  validationErrorRow: (errorIndex) => cy.get(`[data-cy="validation-errors-table-row"] [data-cy="row-${errorIndex}"]`),
  validationErrorColumn: (errorIndex) => cy.get(`[data-cy="validation-errors-table-row"] [data-cy="column-${errorIndex}"]`),
  validationErrorValue: (errorIndex) => cy.get(`[data-cy="validation-errors-table-row"] [data-cy="value-${errorIndex}"]`),
  currentUrl: () => cy.url(),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  assertOnThisPage() {
    this.currentUrl().should('contain', '/utilisation-report-upload');
    this.utilisationReportFileInput().should('exist');
    this.continueButton().should('exist');
  },
  overdueListItem: (reportPeriodStartMonth, reportPeriodStartYear) =>
    cy.get(`[data-cy="list-item-${reportPeriodStartMonth}-${reportPeriodStartYear}__overdue"]`),
};

module.exports = page;
