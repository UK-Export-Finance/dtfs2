const userProfile = {
  firstname: () => cy.get('[data-cy="user-firstname"]'),
  lastName: () => cy.get('[data-cy="user-lastName"]'),
  roles: () => cy.get('[data-cy="user-roles"]'),
  bank: () => cy.get('[data-cy="user-bank"]'),
  email: () => cy.get('[data-cy="user-email"]'),
  lastLogin: () => cy.get('[data-cy="user-last-login"]'),
};

module.exports = userProfile;
