const page = {
  signOutButton: () => cy.get('[data-cy="logout-button"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;
