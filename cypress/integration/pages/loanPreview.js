const page = {
  facilityStage: () => cy.get('[data-cy="facility-stage"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
