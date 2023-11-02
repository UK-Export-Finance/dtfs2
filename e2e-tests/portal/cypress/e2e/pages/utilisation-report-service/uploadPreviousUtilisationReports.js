const page = {
  utilisationReportFileInput: () => cy.get('[data-cy="utilisation-report-file-upload"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  warningText: () => cy.get('[data-cy="warning-text"]'),
  dueReportsList: () => cy.get('[data-cy="due-reports-list"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;
