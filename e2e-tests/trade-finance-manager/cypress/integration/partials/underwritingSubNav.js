const underwritingNav = {
  leadUnderwriterLink: () => cy.get('[data-cy="lead-underwriter"]'),
  bankSecurityLink: () => cy.get('[data-cy="bank-security"]'),
  pricingAndRiskLink: () => cy.get('[data-cy="pricing-and-risk"]'),
  underwriterManagerDecisionLink: () => cy.get('[data-cy="underwriter-managers-decision"]'),
};

module.exports = underwritingNav;
