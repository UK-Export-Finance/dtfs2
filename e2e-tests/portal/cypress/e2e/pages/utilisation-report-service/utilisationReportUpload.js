const page = {
  utilisationReportFileInput: () => cy.get('[data-cy="utilisation-report-file-upload"]'),
  utilisationReportFileInputErrorMessage: () => cy.get('[data-cy="utilisation-report-file-upload-error-message"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;
