const utilisationReportsPage = {
  visit: () => cy.visit('/utilisation-reports'),
  heading: (submissionMonth) => cy.get(`[data-cy="${submissionMonth}-submission-month-report-period-heading"]`),
  dueDateText: (submissionMonth) => cy.get(`[data-cy="${submissionMonth}-submission-month-report-due-date-text"]`),
  tableRowSelector: (bankId, submissionMonth) =>
    cy.get(`[data-cy="utilisation-report-reconciliation-table-row-bank-${bankId}-submission-month-${submissionMonth}"]`),
  clickMarkReportAsCompletedButton: (submissionMonth) =>
    cy.get(`[data-cy="utilisation-reports-form--${submissionMonth}"]`).within(($form) => {
      cy.wrap($form).get('[data-cy="mark-report-as-completed-button"]').click();
    }),
  clickMarkReportAsNotCompletedButton: (submissionMonth) =>
    cy.get(`[data-cy="utilisation-reports-form--${submissionMonth}"]`).within(($form) => {
      cy.wrap($form).get('[data-cy="mark-as-not-completed-button"]').click();
    }),
};

module.exports = utilisationReportsPage;
