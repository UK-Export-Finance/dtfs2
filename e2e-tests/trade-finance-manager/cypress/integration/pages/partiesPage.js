const partiesPage = {
  exporterArea: () => cy.get('[data-cy="parties-exporter"]'),
  exporterEditLink: () => cy.get('[data-cy="parties-exporter"] [data-cy="edit-party-link"]'),
  buyerArea: () => cy.get('[data-cy="parties-buyer"]'),
  buyerEditLink: () => cy.get('[data-cy="parties-buyer"] [data-cy="edit-party-link"]'),
  agentArea: () => cy.get('[data-cy="parties-agent"]'),
  agentEditLink: () => cy.get('[data-cy="parties-agent"] [data-cy="edit-party-link"]'),
  indemnifierArea: () => cy.get('[data-cy="parties-indemnifier"]'),
  indemnifierEditLink: () => cy.get('[data-cy="parties-indemnifier"] [data-cy="edit-party-link"]'),
  bondIssuerFacilitiesTable: {
    row: (facilityId) => {
      const row = cy.get(`[data-cy="facility-${facilityId}"]`);
      return {
        row,
        facilityId: () => row.get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
      };
    },
  },
};

module.exports = partiesPage;
