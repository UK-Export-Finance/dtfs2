const utilisationReportsSummaryPage = {
  visit: () => cy.visit('/utilisation-reports'),
  heading: (submissionMonth) => cy.get(`[data-cy="${submissionMonth}-submission-month-report-period-heading"]`),
  tableRowSelector: (bankId, submissionMonth) =>
    cy.get(`[data-cy="utilisation-report-reconciliation-table-row-bank-${bankId}-submission-month-${submissionMonth}"]`),
};

module.exports = { utilisationReportsSummaryPage };
