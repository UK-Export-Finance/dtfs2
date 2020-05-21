const partial = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),
  aboutSupplierLink: () => cy.get('[data-cy="progress-nav-item-link-about/supplier"]'),
  aboutBuyerLink: () => cy.get('[data-cy="progress-nav-item-link-about/buyer"]'),
  aboutFinancialLink: () => cy.get('[data-cy="progress-nav-item-link-about/financial"]'),
  previewLink: () => cy.get('[data-cy="progress-nav-item-link-about/preview"]'),
  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = partial;
