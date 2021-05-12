const probabilityOfDefaultPage = {
  probabilityOfDefaultInput: () => cy.get('[data-cy="input-probability-of-default"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = probabilityOfDefaultPage;
