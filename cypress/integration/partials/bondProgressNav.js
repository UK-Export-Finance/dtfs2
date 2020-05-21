const partial = {
  bondId: () => cy.get('[data-cy="bond-id"]'),
  progressNavLinkBondDetails: () => cy.get('[data-cy="progress-nav-item-link-bond-details"]'),
  progressNavBondDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-details-completed-checkbox"]'),
  progressNavLinkBondFinancialDetails: () => cy.get('[data-cy="progress-nav-item-link-bond-financial-details"]'),
  progressNavBondFinancialDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-financial-details-completed-checkbox"]'),
  progressNavLinkBondFeeDetails: () => cy.get('[data-cy="progress-nav-item-link-bond-fee-details"]'),
  progressNavBondFeeDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-bond-fee-details-completed-checkbox"]'),
  progressNavBondTextPreview: () => cy.get('[data-cy="progress-nav-item-bond-preview"]'),
  progressNavLinkBondPreview: () => cy.get('[data-cy="progress-nav-item-link-bond-preview"]'),
};

module.exports = partial;
