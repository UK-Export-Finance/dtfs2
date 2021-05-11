const lossGivenDefaultPage = {
  lossGivenDefaultInput: () => cy.get('[data-cy="input-loss-given-default"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = lossGivenDefaultPage;
