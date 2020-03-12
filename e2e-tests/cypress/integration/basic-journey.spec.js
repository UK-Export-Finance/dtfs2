context('Following the basic user journey', () => {

  it('follows the page flow starting at /start-now', () => {
    cy.visit('http://localhost:5000/start-now')
    cy.xpath("//a[contains(text(), 'Create new submission')]").click()

    cy.get('#criteria-met').click()
    cy.xpath("//button[contains(text(), 'Submit')]").click()

    cy.get('#criteria-met').click()
    cy.xpath("//button[contains(text(), 'Submit')]").click()
  })

})
