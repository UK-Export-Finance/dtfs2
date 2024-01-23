const utilisationReportsPage = {
  heading: (submissionMonth) => cy.get(`[data-cy="${submissionMonth}-submission-month-report-period-heading"]`),
  dueDateText: (submissionMonth) => cy.get(`[data-cy="${submissionMonth}-submission-month-report-due-date-text"]`),
  tableRowSelector: (bankId, submissionMonth) => cy.get(`[data-cy="utilisation-report-reconciliation-table-row-bank-${bankId}-submission-month-${submissionMonth}"]`),
  // checkboxSelector: (bankId) => cy.get(), // TODO: FN-1615
};

module.exports = utilisationReportsPage;
