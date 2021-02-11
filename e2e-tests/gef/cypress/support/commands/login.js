export default function login(opts) {
  console.log('HERE')
  const { username, password } = opts

  cy.visit('/')
  cy.get('[data-cy="email"]').type(username)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="LogIn"]').click()
}
