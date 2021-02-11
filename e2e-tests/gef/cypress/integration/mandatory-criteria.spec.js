import relative from './relativeURL'

context('Mandatory Criteria Page', () => {
  beforeEach(() => {
    cy.login({ username: 'MAKER', password: 'AbC!2345' })
    cy.on('uncaught:exception', () => false)
    cy.visit(relative('/gef/mandatory-criteria'))
  })

  describe('Visiting page', () => {
    it ('displays the header', () => {
      cy.get('[data-cy="heading-caption"]')
      cy.get('[data-cy="main-heading"]')
    })

    it ('displays the mandatory criteria text', () => {
      // Need to mock api response
      cy.get('[data-cy="mandatory-criteria"]')
    })
  })

  describe('Clicking on Continue', () => {
    it ('returns error when no radio button has been selected', () => {
      cy.get('[data-cy="form"]').submit()
      cy.get('[data-cy="mandatory-criteria-error"]')
    })

    it('redirects the user to ** when they select False', () => {
      cy.get('[data-cy="mandatory-criteria-false"]').click()
      cy.get('[data-cy="form"]').submit()
      cy.url().should('eq', relative('/gef/mandatory-criteria'))
    })

    it('redirects the user to the Name Application page', () => {
      cy.get('[data-cy="mandatory-criteria-true"]').click()
      cy.get('[data-cy="form"]').submit()
      cy.url().should('eq', relative('/gef/name-application'))
    })
  })
})
