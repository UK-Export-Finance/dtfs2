const page = {
  mainHeading: () => cy.get('[data-cy="confirmation-main-heading"]'),
  signOutButton: () => cy.get('[data-cy="logout-button"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;
