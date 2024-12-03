const partial = {
  container: () => cy.get('[data-cy="fee-record-summary"]'),
  facilityId: () => cy.get('[data-cy="facility-id"]'),
  exporter: () => cy.get('[data-cy="exporter"]'),
  requestedBy: () => cy.get('[data-cy="requested-by"]'),
};

module.exports = partial;
