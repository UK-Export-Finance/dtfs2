const page = {
  premiumType: () => cy.get('[data-cy="premium-type"]'),
  premiumFrequency: () => cy.get('[data-cy="premium-frequency"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
