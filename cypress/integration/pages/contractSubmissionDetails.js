const page = {
  goBackLink: () => cy.get('[data-cy="go-back-link"]'),
  editLinkAboutSupplier: (dealId) => cy.get(`[data-cy="edit-about-link-/contract/${dealId}/about/supplier"]`),
  editLinkConfirmEligibility: (dealId) => cy.get(`[data-cy="edit-eligibility-link-/contract/${dealId}/eligibility/criteria"]`),
  editLinkBond: (dealId, bondId) => cy.get(`[data-cy="edit-bond-${bondId}-link-/contract/${dealId}/bond/${bondId}/details"]`),
  editLinkLoan: (dealId, loanId) => cy.get(`[data-cy="edit-loan-${loanId}-link-/contract/${dealId}/loan/${loanId}/guarantee-details"]`),
};

module.exports = page;
