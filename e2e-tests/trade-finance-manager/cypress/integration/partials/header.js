const partial = {
  userLink: () => cy.get('[data-cy="header-user-link"]'),
  signOutLink: () => cy.get('[data-cy="header-sign-out-link"]'),
};

module.exports = partial;
