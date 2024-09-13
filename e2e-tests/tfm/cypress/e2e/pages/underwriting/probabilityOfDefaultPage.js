const probabilityOfDefaultPage = {
  probabilityOfDefaultInput: () => cy.get('[data-cy="input-probability-of-default"]'),

  errorMessage: () => cy.get('[data-cy="probability-of-default-error"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = probabilityOfDefaultPage;
