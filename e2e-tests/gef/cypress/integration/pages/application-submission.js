/* eslint-disable no-undef */
const applicationSubmission = {
  applicationSubmissionPage: () => cy.get('[data-cy="application-submit-page"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  commentsField: () => cy.get('[data-cy="application-comments"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  confirmationPanelTitle: () => cy.get('[data-cy="submit-confirmation-title"]'),
  backToDashboadLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default applicationSubmission;
