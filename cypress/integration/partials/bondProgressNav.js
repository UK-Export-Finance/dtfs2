const partial = {
  bondId: () => cy.get('[data-cy="bond-id"]'),
  progressNavBondDetails: () => cy.get('[data-cy="progress-nav-item-bond-details"]'),
  progressNavBondDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-details-completed-checkbox"]'),
  progressNavBondFinancialDetails: () => cy.get('[data-cy="progress-nav-item-bond-financial-details"]'),
  progressNavBondFinancialDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-financial-details-completed-checkbox"]'),
  progressNavBondFeeDetails: () => cy.get('[data-cy="progress-nav-item-bond-fee-details"]'),
  progressNavBondFeeDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-fee-details-completed-checkbox"]'),
  progressNavBondPreview: () => cy.get('[data-cy="progress-nav-item-bond-preview"]'),
  progressNavBondPreviewCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-preview-completed-checkbox"]'),
};

module.exports = partial;
