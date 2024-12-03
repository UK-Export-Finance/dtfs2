const cancelCancellationPage = {
  noGoBackButton: () => cy.get('[data-cy="no-go-back-button"]'),
  yesCancelButton: () => cy.get('[data-cy="yes-cancel-button"]'),
};

module.exports = cancelCancellationPage;
