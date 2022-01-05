/* eslint-disable no-undef */
const applicationSubmission = {
  applicationSubmissionPage: () => cy.get('[data-cy="application-submit-page"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  commentsField: () => cy.get('[data-cy="application-comments"]'),
  submissionText: () => cy.get('[data-cy="application-submission-text"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  confirmationPanelTitle: () => cy.get('[data-cy="submit-confirmation-title"]'),
  confirmationPanelTitleFacilities: () => cy.get('[data-cy="submit-facilities-confirmation-title"]'),
  confirmationText: () => cy.get('[data-cy="confirmation-text"]'),
  backToDashboadLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default applicationSubmission;
