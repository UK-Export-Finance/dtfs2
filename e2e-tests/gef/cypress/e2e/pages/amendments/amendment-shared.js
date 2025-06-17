const amendmentPage = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  returnLink: () => cy.get('[data-cy="return-link"]'),
  returnButton: () => cy.get('[data-cy="return-button"]'),
  abandon: () => cy.get('[data-cy="abandon-button"]'),
  header: () => cy.get('[data-cy="heading"]'),
};

module.exports = amendmentPage;
