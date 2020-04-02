const page = {
  visit: () => cy.visit('/before-you-start'),
  true: () => cy.get('#criteriaMet'),
  false: () => cy.get('#criteriaMet-2'),
  submit: () => cy.get('#submit-red-line'),
  eligiblePerson: () => '//TODO'
}

module.exports = page;
