const caseDealPage = {
  caseSummary: () => cy.get('[data-cy="case-summary"]'),
  caseSubNavigation: () => cy.get('[data-cy="case-sub-navigation"]'),
  dealBankDetails: () => cy.get('[data-cy="deal-bank-details"]'),
  dealFacilities: () => cy.get('[data-cy="deal-facilities"]'),
  mgaVersion: () => cy.get('[data-cy="mga-version"]'),
  partiesLink: () => cy.get('[data-cy="parties-link"]'),

  dealFacilitiesTable: {
    row: (facilityId) => {
      const row = cy.get(`[data-cy="facility-${facilityId}"]`);
      return {
        row,
        facilityId: () => row.get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
        facilityTenor: () => row.get(`[data-cy="facility-${facilityId}-tenor"]`),
      };
    },
  },

};

module.exports = caseDealPage;
