const page = {
  visit: () => cy.visit('/admin/users/'),
  addUser: () => cy.get('[data-cy="admin-add-user"]'),
  cancel: () => cy.get('[data-cy="admin-cancel"]'),
  user: (user) => cy.get(`[data-cy="user-${user.username}"]`),
  row: (user) => ({
    username: () => cy.get(`[data-cy="username-${user.username}"]`),
    lastLogin: () => cy.get(`[data-cy="lastLogin-${user.username}"]`),
    roles: () => cy.get(`[data-cy="roles-${user.username}"]`),
  }),

};

module.exports = page;
