const temporarilySuspendedAccessCode = {
  visit: () => cy.visit('/login/temporarily-suspended-access-code'),
  heading: () => cy.get('[data-cy="account-temporarily-suspended-heading"]'),
  message: () => cy.get('[data-cy="account-temporarily-suspended-message"]'),
};

module.exports = temporarilySuspendedAccessCode;
