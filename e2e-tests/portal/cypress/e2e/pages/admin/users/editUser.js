const page = {
  visit: (id) => cy.visit(`/admin/users/edit/${id}`),

  role: (role) => cy.get(`[data-cy="role-${role}"]`),
  username: () => cy.get('[data-cy="username"]'),
  password: () => cy.get('[data-cy="password"]'),
  confirmPassword: () => cy.get('[data-cy="confirm-password"]'),
  firstname: () => cy.get('[data-cy="firstname"]'),
  surname: () => cy.get('[data-cy="surname"]'),
  bank: () => cy.get('[data-cy="bank"]'),

  Deactivate: () => cy.get('[data-cy="user-status-blocked"]'),
  Activate: () => cy.get('[data-cy="user-status-active"]'),

  isTrustedTrue: () => cy.get('[data-cy="is-trusted-true"]'),
  isTrustedFalse: () => cy.get('[data-cy="is-trusted-false"]'),

  save: () => cy.get('[data-cy="Save"]'),
  changePassword: () => cy.get('[data-cy="change-password-button"]'),
};

module.exports = page;
