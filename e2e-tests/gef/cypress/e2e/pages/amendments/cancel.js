const cancel = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  continueButton: () => cy.get('[data-cy="yes-cancel-button"]'),
  goBackButton: () => cy.get('[data-cy="no-go-back-button"]'),
};

module.exports = cancel;
