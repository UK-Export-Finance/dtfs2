/* eslint-disable no-undef */
const login = (credentials) => {
  const { username, password } = credentials;

  cy.visit('/login');
  cy.get('[data-cy="email"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="LogIn"]').click();
};

export default login;
