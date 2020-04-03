const page = {
  visit: () => cy.visit('/before-you-start'),
  true: () => cy.get('[data-cy="True"]'),
  false: () => cy.get('[data-cy="False"]'),
  submit: () => cy.get('[data-cy="Submit"]'),
  eligiblePerson: () => '//TODO'
}

module.exports = page;
