const unissuedFacilityTable = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  individualSuccessBanner: () => cy.get('[data-cy:"success-banner"]'),
  unissuedFacilitiesTable: () => cy.get('[data-cy:"unissued-facilities-table"]'),
  updateFacilitiesLater: () => cy.get('[data-cy:"update-later-link"]'),
  allUnissuedUpdatedSuccess: () => cy.get('[data-cy:"all-unissued-updated-success-banner"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
};

export default unissuedFacilityTable;
