const page = {
  visit: () => cy.visit('/admin/users/create'),

  role: (role) => cy.get(`[data-cy="role-${role}"]`),
  username: () => cy.get('[data-cy="username"]'),
  firstname: () => cy.get('[data-cy="firstname"]'),
  surname: () => cy.get('[data-cy="surname"]'),
  bank: () => cy.get('[data-cy="bank"]'),
  createUser: () => cy.get('[data-cy="create-user-add"]'),
  cancel: () => cy.get('[data-cy="create-user-cancel"]'),
};

module.exports = page;
