const page = {
  visit: () => cy.visit('/admin/users/create'),

  role: (role) => cy.get(`[data-cy="role-${role}"]`),
  username: () => cy.get('[data-cy="username"]'),
  firstname: () => cy.get('[data-cy="firstname"]'),
  surname: () => cy.get('[data-cy="surname"]'),
  bank: () => cy.get('[data-cy="bank"]'),
  isTrustedTrue: () => cy.get('[data-cy="is-trusted-true"]'),
  isTrustedFalse: () => cy.get('[data-cy="is-trusted-false"]'),
  createUser: () => cy.get('[data-cy="create-user-add"]'),
  cancel: () => cy.get('[data-cy="create-user-cancel"]'),
  firstNameError: () => cy.get('[data-cy="firstname-error-message"]'),
  surNameError: () => cy.get('[data-cy="surname-error-message"]'),
  rolesError: () => cy.get('[data-cy="roles-error-message"]'),
  bankError: () => cy.get('[data-cy="bank-error-message"]'),
};

module.exports = page;
