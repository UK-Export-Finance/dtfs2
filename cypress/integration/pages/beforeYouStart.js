const page = {
  confirm: () => {
    cy.url().then((url) => {
      return url.match(/before-you-start/g);
    })
  },
  true: () => cy.get('#criteriaMet'),
  false: () => cy.get('#criteriaMet-2'),
  submit: () => cy.get('#submit-red-line'),
  eligiblePerson: () => '//TODO'
}

module.exports = page;
