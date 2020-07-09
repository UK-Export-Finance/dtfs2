const page = {
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
  bondIssuer: () => cy.get('[data-cy="bond-issuer"]'),
};

module.exports = page;
