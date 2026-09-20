const applicationSubmission = {
  applicationSubmissionPage: () => cy.get('[data-cy="application-submit-page"]'),
  commentsField: () => cy.get('[data-cy="application-comments"]'),
  submissionText: () => cy.get('[data-cy="application-submission-text"]'),
  confirmSubmissionCheckbox: () => cy.get('[data-cy="confirm-submit-ukef-checkbox"]'),
  confirmation: () => cy.get('[data-cy="application-submission-confirmation"]'),
  confirmationPanelTitle: () => cy.get('[data-cy="submit-confirmation-title"]'),
  confirmationPanelTitleFacilities: () => cy.get('[data-cy="submit-facilities-confirmation-title"]'),
  confirmationText: () => cy.get('[data-cy="confirmation-text"]'),
  backToDashboardLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default applicationSubmission;
