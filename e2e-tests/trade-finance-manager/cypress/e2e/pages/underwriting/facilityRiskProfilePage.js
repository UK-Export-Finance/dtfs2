const facilityRiskProfilePage = {
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),

  legendLink: () => cy.get('[data-cy="edit-facility-risk-profile-legend-link"]'),

  riskProfileRadioInputFlat: () => cy.get('[data-cy="facility-risk-profile-input-flat"]'),
  riskProfileRadioInputVariable: () => cy.get('[data-cy="facility-risk-profile-input-variable"]'),
  riskProfileRadioInputValidationError: () => cy.get('[data-cy="facility-risk-profile-input-error"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = facilityRiskProfilePage;
