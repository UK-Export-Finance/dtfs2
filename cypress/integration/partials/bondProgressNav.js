const partial = {
  bondId: () => cy.get('[data-cy="bond-id"]'),
  progressNavBondDetails: () => cy.get('[data-cy="progress-nav-item-bond-details"]'),
  progressNavBondFinancialDetails: () => cy.get('[data-cy="progress-nav-item-bond-financial-details"]'),
  progressNavBondFeeDetails: () => cy.get('[data-cy="progress-nav-item-bond-fee-details"]'),
};

module.exports = partial;
