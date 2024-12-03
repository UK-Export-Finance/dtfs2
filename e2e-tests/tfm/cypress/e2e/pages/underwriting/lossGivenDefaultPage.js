const lossGivenDefaultPage = {
  lossGivenDefaultInput: () => cy.get('[data-cy="input-loss-given-default"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = lossGivenDefaultPage;
