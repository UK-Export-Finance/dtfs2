const partial = {
  progressNavBondDetails: () => cy.get('[data-cy="progress-nav-item-bond-details"]'),
  progressNavBondFinancialDetails: () => cy.get('[data-cy="progress-nav-item-bond-financial-details"]'),
  progressNavBondFeeDetails: () => cy.get('[data-cy="progress-nav-item-bond-fee-details"]'),
};

module.exports = partial;
