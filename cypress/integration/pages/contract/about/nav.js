const partial = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),

  aboutSupplierComplete: () => cy.get('[data-cy="progress-nav-item-about/supplier--completed-checkbox"]'),
  aboutSupplierLink: () => cy.get('[data-cy="progress-nav-item-link-about/supplier"]'),
  aboutBuyerComplete: () => cy.get('[data-cy="progress-nav-item-about/buyer--completed-checkbox"]'),
  aboutBuyerLink: () => cy.get('[data-cy="progress-nav-item-link-about/buyer"]'),
  aboutFinancialComplete: () => cy.get('[data-cy="progress-nav-item-about/financial--completed-checkbox"]'),
  aboutFinancialLink: () => cy.get('[data-cy="progress-nav-item-link-about/financial"]'),
  previewLink: () => cy.get('[data-cy="progress-nav-item-link-about/preview"]'),
  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = partial;
