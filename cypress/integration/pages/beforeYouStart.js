const page = {
  confirm: () => {
    cy.location('href').then((url) => {
      return url.matches(/before-you-start/g);
    })
  },
  true: () => cy.get('#criteriaMet'),
  false: () => cy.get('#criteriaMet-2'),
  submit: () => cy.get('#submit-red-line'),
  eligiblePerson: () => '//TODO'
}

module.exports = page;
