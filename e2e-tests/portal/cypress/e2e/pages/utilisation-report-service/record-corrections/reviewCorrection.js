const page = {
  changeNewValuesLink: () => cy.get('a[data-cy="change-record-correction-new-values-link"]'),
  originalValuesSummaryList: () => cy.get('[data-cy="original-values-summary-list"]'),
  recordCorrectionDetailsSummaryList: () => cy.get('[data-cy="record-correction-details-summary-list"]'),
};

module.exports = page;
