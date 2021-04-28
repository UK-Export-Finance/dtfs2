const managersDecisionFormPage = {
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),

  decisionRadioInputApproveWithoutConditions: () => cy.get('[data-cy="approve-without-conditions-radio-button"]'),
  decisionRadioInputApproveWithConditions: () => cy.get('[data-cy="approve-with-conditions-radio-button"]'),
  decisionRadioInputDecline: () => cy.get('[data-cy="decline-radio-button"]'),
  decisionRadioInputValidationError: () => cy.get('[data-cy="decision-input-error"]'),

  commentsInputApproveWithConditions: () => cy.get('[data-cy="approveWithConditionsComments-input"]'),
  commentsInputApproveWithConditionsValidationError: () => cy.get('[data-cy="approveWithConditionsComments-input-error"]'),

  commentsInputDecline: () => cy.get('[data-cy="declineComments-input"]'),
  commentsInputDeclineValidationError: () => cy.get('[data-cy="declineComments-input-error"]'),

  commentsInputInternal: () => cy.get('[data-cy="internalComments-input"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = managersDecisionFormPage;
