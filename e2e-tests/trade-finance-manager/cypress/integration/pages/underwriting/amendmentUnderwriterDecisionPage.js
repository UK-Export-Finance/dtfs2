const amendmentUnderwriterDecisionPage = {
  heading: () => cy.get('[data-cy="amendment-managers-decision"]'),

  // form
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),

  decisionRadioInputApproveWithoutConditions: () => cy.get('[data-cy="approve-without-conditions-radio-button"]'),
  decisionApproveWithoutConditionsHint: () => cy.get('[data-cy="approve-without-conditions-hint"]'),

  decisionRadioInputApproveWithConditions: () => cy.get('[data-cy="approve-with-conditions-radio-button"]'),
  decisionApproveWithConditionsHint: () => cy.get('[data-cy="approve-with-conditions-hint"]'),

  decisionRadioInputDecline: () => cy.get('[data-cy="decline-radio-button"]'),
  decisionDeclineHint: () => cy.get('[data-cy="decline-hint"]'),

  decisionRadioInputValidationError: () => cy.get('[data-cy="decision-input-error"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = amendmentUnderwriterDecisionPage;
