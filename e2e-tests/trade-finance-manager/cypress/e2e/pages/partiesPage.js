const partiesPage = {
  partiesHeading: () => cy.get('[data-cy="parties-heading"]'),
  exporterArea: () => cy.get('[data-cy="parties-exporter"]'),
  exporterEditLink: () => cy.get('[data-cy="parties-exporter"] [data-cy="edit-party-link"]'),
  buyerArea: () => cy.get('[data-cy="parties-buyer"]'),
  buyerEditLink: () => cy.get('[data-cy="parties-buyer"] [data-cy="edit-party-link"]'),
  agentArea: () => cy.get('[data-cy="parties-agent"]'),
  agentEditLink: () => cy.get('[data-cy="parties-agent"] [data-cy="edit-party-link"]'),
  indemnifierArea: () => cy.get('[data-cy="parties-indemnifier"]'),
  indemnifierEditLink: () => cy.get('[data-cy="parties-indemnifier"] [data-cy="edit-party-link"]'),
  bondIssuerEditLink: () => cy.get('[data-cy="bond-issuer-area"] [data-cy="edit-party-link"]'),
  bondBeneficiaryEditLink: () => cy.get('[data-cy="bond-beneficiary-area"] [data-cy="edit-party-link"]'),
  bondIssuerFacilitiesTable: {
    row: (facilityId) => {
      cy.get(`[data-cy="bond-issuer-facilities-table"] [data-cy="facility-${facilityId}"]`).as('row');
      return {
        facilityId: () => cy.get('@row').get(`[data-cy="bond-issuer-facilities-table"] [data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
      };
    },
  },
  bondBeneficiaryFacilitiesTable: {
    row: (facilityId) => {
      cy.get(`[data-cy="bond-beneficiary-facilities-table"] [data-cy="facility-${facilityId}"]`).as('row');
      return {
        facilityId: () => cy.get('@row').get(`[data-cy="bond-beneficiary-facilities-table"] [data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
      };
    },
  },
};

module.exports = partiesPage;
