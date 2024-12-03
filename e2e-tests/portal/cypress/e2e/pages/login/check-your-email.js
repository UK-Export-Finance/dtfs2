const checkYourEmail = {
  visit: ({ failOnStatusCode = true } = {}) => cy.visit('/login/check-your-email', { failOnStatusCode }),
  sendNewSignInLinkButton: () => cy.get('[data-cy="request-new-sign-in-link"]'),
  obscuredSignInLinkTargetEmailAddressText: () => cy.get('[data-cy="obscured-sign-in-link-target-email-address"]'),
  attemptsRemaining: () => cy.get('[data-cy="attempts-remaining"]'),
  sendNewSignInLink: () => checkYourEmail.sendNewSignInLinkButton().click(),
  accountSuspended: () => cy.get('[data-cy="account-suspended"]'),
  csrfToken: () => cy.get('[data-cy=csrf-input]').then((csrfInput) => csrfInput.attr('value')),
};

module.exports = checkYourEmail;
