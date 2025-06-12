// Selectors for the abandon page elements
const abandon = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  yesAbandonButton: () => cy.get('[data-cy="yes-abandon-button"]'),
  noKeepButton: () => cy.get('[data-cy="no-keep-button"]'),
};

module.exports = abandon;
