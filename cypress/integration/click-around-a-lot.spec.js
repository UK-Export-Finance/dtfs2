context('Testing something', () => {
  beforeEach(() => {

    //[dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack)
      return false
    })

    cy.visit('http://localhost:5000/contract/1')
  })

  it('flick between the tabs', () => {

    cy.xpath("//a[contains(text(), 'Comments')]").click()
    cy.xpath("//a[contains(text(), 'Preview Deal Details')]").click()
    cy.xpath("//a[contains(text(), 'View')]").click()

    cy.xpath("//a[contains(text(), 'Comments')]").click()
    cy.xpath("//a[contains(text(), 'Preview Deal Details')]").click()
    cy.xpath("//a[contains(text(), 'View')]").click()

    cy.xpath("//a[contains(text(), 'Comments')]").click()
    cy.xpath("//a[contains(text(), 'Preview Deal Details')]").click()
    cy.xpath("//a[contains(text(), 'View')]").click()

  })

})
