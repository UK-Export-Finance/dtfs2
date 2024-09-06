const unissuedFacilityTable = {
  individualSuccessBanner: () => cy.get('[data-cy="success-banner"]'),
  unissuedFacilitiesTable: () => cy.get('[data-cy="unissued-facilities-table"]'),
  updateIndividualFacilityButton: (id) => cy.get(`[data-cy="update-facility-button-${id}"]`),
  updateFacilitiesLater: () => cy.get('[data-cy="update-later-link"]'),
  successBanner: () => cy.get('[data-cy="success-banner"]'),
  allUnissuedUpdatedSuccess: () => cy.get('[data-cy="all-unissued-updated-success-banner"]'),
  rows: () => cy.get('.govuk-table__body .govuk-table__row'),
};

export default unissuedFacilityTable;
