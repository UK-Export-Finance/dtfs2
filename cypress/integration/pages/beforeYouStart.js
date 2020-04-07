const page = {
  visit: () => cy.visit('/before-you-start'),
  true: () => cy.get('[data-cy="criteriaMet-true"]'),
  false: () => cy.get('[data-cy="criteriaMet-false"]'),
  submit: () => cy.get('button'),
  eligiblePerson: () => '//TODO'
}

module.exports = page;
