const amendmentPage = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  returnLink: () => cy.get('[data-cy="return-link"]'),
  header: () => cy.get('[data-cy="heading"]'),
};

module.exports = amendmentPage;
