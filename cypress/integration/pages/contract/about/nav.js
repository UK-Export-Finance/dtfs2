const partial = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),
  aboutSupplierLink: () => cy.get('[data-cy="progress-nav-item-about/supplier"]'),
  aboutBuyerLink: () => cy.get('[data-cy="progress-nav-item-about/buyer"]'),
  aboutFinancialLink: () => cy.get('[data-cy="progress-nav-item-about/financial"]'),
  previewLink: () => cy.get('[data-cy="progress-nav-item-about/bond"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = partial;
