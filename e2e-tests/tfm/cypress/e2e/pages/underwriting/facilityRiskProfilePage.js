const facilityRiskProfilePage = {
  legendLink: () => cy.get('[data-cy="edit-facility-risk-profile-legend-link"]'),

  riskProfileRadioInputFlat: () => cy.get('[data-cy="facility-risk-profile-input-flat"]'),
  riskProfileRadioInputVariable: () => cy.get('[data-cy="facility-risk-profile-input-variable"]'),
  riskProfileRadioInputValidationError: () => cy.get('[data-cy="facility-risk-profile-input-error"]'),
};

module.exports = facilityRiskProfilePage;
