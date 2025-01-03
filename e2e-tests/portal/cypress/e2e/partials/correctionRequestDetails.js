const partial = {
  container: () => cy.get('[data-cy="correction-request-details-table"]'),
  headers: {
    errorType: () => cy.get('[data-cy="correction-request-details-table-header--error-type"]'),
  },
  row: {
    facilityId: () => cy.get('[data-cy="correction-request-details-table--facility-id"]'),
    exporter: () => cy.get('[data-cy="correction-request-details-table--exporter"]'),
    reportedFees: () => cy.get('[data-cy="correction-request-details-table--reported-fees"]'),
    formattedReasons: () => cy.get('[data-cy="correction-request-details-table--formatted-reasons"]'),
    additionalInfo: () => cy.get('[data-cy="correction-request-details-table--additional-info"]'),
  },
};

module.exports = partial;
