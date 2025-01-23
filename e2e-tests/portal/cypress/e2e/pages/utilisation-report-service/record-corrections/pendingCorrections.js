const page = {
  table: () => cy.get('[data-cy="pending-corrections-table"]'),
  rows: () => cy.get(`[data-cy="pending-corrections-table"] tr`),
  row: (index) => ({
    facilityId: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="pending-corrections-row--facility-id"]`),
    exporter: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="pending-corrections-row--exporter"]`),
    reportedFeesPaid: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="pending-corrections-row--reported-fees-paid"]`),
    errorType: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="pending-corrections-row--error-type"]`),
    errorSummary: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="pending-corrections-row--error-summary"]`),
    correctionLink: () => cy.get(`[data-cy="pending-corrections-table"] tr:nth-child(${index}) [data-cy="correction-link"]`),
  }),
  correctionsHeading: () => cy.get('[data-cy="pending-corrections-heading"]'),
  nextReportDueHeading: () => cy.get('[data-cy="next-report-due-heading"]'),
  nextReportDueText: () => cy.get('[data-cy="next-report-due-text"]'),
  noReportDueHeading: () => cy.get('[data-cy="no-report-due-heading"]'),
  noReportDueText: () => cy.get('[data-cy="no-report-due-text"]'),
};

module.exports = page;
