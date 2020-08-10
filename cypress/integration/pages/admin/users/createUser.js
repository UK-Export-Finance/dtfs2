const page = {
  visit: () => cy.visit('/admin/users/create'),

  role: (role) => cy.get(`[data-cy="role-${role}"]`),
  username: () => cy.get(`[data-cy="username"]`),
  password: () => cy.get(`[data-cy="password"]`),
  passwordError: () => cy.get(`#password-error`),
  confirmPassword: () => cy.get(`[data-cy="confirm-password"]`),
  firstname: ()=> cy.get(`[data-cy="firstname"]`),
  surname: ()=> cy.get(`[data-cy="surname"]`),
  bank: () => cy.get(`[data-cy="bank"]`),
  createUser: () => cy.get(`[data-cy="CreateUser"]`),

};

module.exports = page;
