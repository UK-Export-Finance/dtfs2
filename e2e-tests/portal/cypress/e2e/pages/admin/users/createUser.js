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
  firstnameerror: () => cy.get('[data-cy="firstname-error-message"]'),
  surnameerror: () => cy.get('[data-cy="surname-error-message"]'),
  roleserror: () => cy.get('[data-cy="roles-error-message"]'),
  bankerror: () => cy.get('[data-cy="bank-error-message"]'),
};

module.exports = page;
