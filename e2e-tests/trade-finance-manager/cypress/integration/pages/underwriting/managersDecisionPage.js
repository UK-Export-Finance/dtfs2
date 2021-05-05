const managersDecisionPage = {
  // link to form
  addDecisionLink: () => cy.get('[data-cy="add-decision-link"]'),

  // form
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

  // submitted values
  decisionStatusTag: () => cy.get('[data-cy="decision-status-tag"]'),
  decisionMadeBy: () => cy.get('[data-cy="decision-made-by-value"]'),
  decisionDateTime: () => cy.get('[data-cy="date-time-value"]'),
  conditions: () => cy.get('[data-cy="conditions-value"]'),
  internalComments: () => cy.get('[data-cy="internal-comments-value"]'),
};

module.exports = managersDecisionPage;
