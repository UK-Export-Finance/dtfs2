const page = {
  table: () => cy.get('[data-cy="correction-history-table"]'),
  tableHeaders: {
    dateSent: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--date-sent"]`),
    exporter: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--exporter"]`),
    reasons: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--formatted-reasons"]`),
    correctRecord: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--formatted-corrected-values"]`),
    oldRecord: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--formatted-previous-values"]`),
    correctionNotes: () => cy.get(`[data-cy="correction-history-table"] [data-cy="correction-history-header--bank-commentary"]`),
  },
  rows: () => cy.get(`[data-cy="correction-history-table"] tr`),
  row: (index) => ({
    dateSent: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--date-sent"]`),
    exporter: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--exporter"]`),
    reasons: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--formatted-reasons"]`),
    correctRecord: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--formatted-corrected-values"]`),
    oldRecord: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--formatted-previous-values"]`),
    correctionNotes: () => cy.get(`[data-cy="correction-history-table"] tr:nth-child(${index}) [data-cy="correction-history-row--bank-commentary"]`),
  }),
  correctionsTextLine1: () => cy.get('[data-cy="corrections-text-line-1"]'),
  correctionsTextLine2: () => cy.get('[data-cy="corrections-text-line-2"]'),
  noCorrectionsTextLine1: () => cy.get('[data-cy="no-corrections-text-line-1"]'),
  noCorrectionsTextLine2: () => cy.get('[data-cy="no-corrections-text-line-2"]'),
};

module.exports = page;
