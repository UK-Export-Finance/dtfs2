const temporarilySuspendedAccessCode = {
  visit: () => cy.visit('/login/temporarily-suspended-access-code'),
  heading: () => cy.get('[data-cy="temporarily-suspended-access-code-heading"]'),
  message: () => cy.get('[data-cy="temporarily-suspended-access-code-message"]'),
};

module.exports = temporarilySuspendedAccessCode;
