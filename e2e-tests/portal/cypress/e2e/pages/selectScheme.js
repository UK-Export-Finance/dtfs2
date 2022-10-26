const page = {
  visit: () => cy.visit('/select-scheme'),
  bss: () => cy.get('[data-cy="scheme-bss"]'),
  gef: () => cy.get('[data-cy="scheme-gef"]'),
  schemeError: (text) => cy.get('[data-cy="scheme-error"]').contains(text),
  continue: () => cy.get('[data-cy="continue-button"]'),
  cancel: () => cy.get('[data-cy="cancel-button"]'),
};

module.exports = page;
