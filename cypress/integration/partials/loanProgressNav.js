const partial = {
  progressNavLinkLoanGuaranteeDetails: () => cy.get('[data-cy="progress-nav-item-link-guarantee-details"]'),
  progressNavLinkLoanFinancialDetails: () => cy.get('[data-cy="progress-nav-item-link-loan-financial-details"]'),
  progressNavLinkLoanDatesRepayments: () => cy.get('[data-cy="progress-nav-item-link-loan-dates-repayments"]'),
};

module.exports = partial;
