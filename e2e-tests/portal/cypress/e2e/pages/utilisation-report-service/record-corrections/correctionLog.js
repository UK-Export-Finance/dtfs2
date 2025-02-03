const page = {
  table: () => cy.get('[data-cy="correction-log-table"]'),
  tableHeaders: {
    dateSent: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--date-sent"]`),
    exporter: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--exporter"]`),
    reasons: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--formatted-reasons"]`),
    correctRecord: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--formatted-corrected-values"]`),
    oldRecord: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--formatted-previous-values"]`),
    correctionNotes: () => cy.get(`[data-cy="correction-log-table"] [data-cy="correction-log-header--bank-commentary"]`),
  },
  rows: () => cy.get(`[data-cy="correction-log-table"] tr`),
  row: (index) => ({
    dateSent: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--date-sent"]`),
    exporter: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--exporter"]`),
    reasons: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--formatted-reasons"]`),
    correctRecord: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--formatted-corrected-values"]`),
    oldRecord: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--formatted-previous-values"]`),
    correctionNotes: () => cy.get(`[data-cy="correction-log-table"] tr:nth-child(${index}) [data-cy="correction-log-row--bank-commentary"]`),
  }),
  correctionsTextLine1: () => cy.get('[data-cy="corrections-text-line-1"]'),
  correctionsTextLine2: () => cy.get('[data-cy="corrections-text-line-2"]'),
  noCorrectionsTextLine1: () => cy.get('[data-cy="no-corrections-text-line-1"]'),
  noCorrectionsTextLine2: () => cy.get('[data-cy="no-corrections-text-line-2"]'),
};

module.exports = page;
