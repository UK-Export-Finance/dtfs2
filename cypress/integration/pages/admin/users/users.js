const page = {
  visit: () => cy.visit('/admin/users/'),
  addUser: () => cy.get('[data-cy="AddUser"]'),
  user: (user) =>  cy.get(`[data-cy="user-${user.username}"]`),
  row: (user) => {
    const row = cy.get(`[data-cy="user-${user.username}"]`);
    return {
      username: () => row.get('[data-cy="data-cy="username""]'),
    };
  },

};

module.exports = page;
