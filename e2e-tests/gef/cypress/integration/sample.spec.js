import relative from './relativeURL';

context('Mandatory Criteria Page', () => {
  describe('As a none logged in user', () => {
    it('Redirects me to the login page', () => {
      cy.visit(relative('/gef/mandatory-criteria'))
      cy.url().should('include', '/')
      // ARRANGE
      // - visit page
      // - query for element

      // ACT
      // - interact with that element

      // ASSERT
      // - make an assertion
    })
  })

  describe('As a logged in user', () => {
    beforeEach(() => {
      cy.login(MAKER);
    })

    it('Visits the Mandatory Criteria page', () => {
      console.log(1)
      cy.visit(relative('/gef/mandatory-criteria'))
      cy.url().should('include', '/')
      // ARRANGE
      // - visit page
      // - query for element

      // ACT
      // - interact with that element

      // ASSERT
      // - make an assertion
    })
  })
})
