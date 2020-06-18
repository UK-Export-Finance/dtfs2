const partial = {
  loanId: () => cy.get('[data-cy="loan-id"]'),
  progressNavLinkLoanGuaranteeDetails: () => cy.get('[data-cy="progress-nav-item-link-loan-guarantee-details"]'),
  progressNavLoanGuaranteeDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-loan-guarantee-details-completed-checkbox"]'),

  progressNavLinkLoanFinancialDetails: () => cy.get('[data-cy="progress-nav-item-link-loan-financial-details"]'),
  progressNavLoanFinancialDetailsCompletedCheckbox: () => cy.get('[data-cy="progress-nav-item-loan-financial-details-completed-checkbox"]'),

  progressNavLinkLoanDatesRepayments: () => cy.get('[data-cy="progress-nav-item-link-loan-dates-repayments"]'),
};

module.exports = partial;
