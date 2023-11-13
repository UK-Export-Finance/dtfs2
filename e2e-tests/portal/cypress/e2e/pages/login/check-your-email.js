const checkYourEmail = {
  visit: () => cy.visit('/login/check-your-email'),
  sendNewSignInLinkButton: () => cy.get('[data-cy="request-new-sign-in-link"]'),
  signInLinkTargetEmailAddressText: () => cy.get('[data-cy="sign-in-link-target-email-address"]'),
  attemptsRemaining: () => cy.get('[data-cy="attempts-remaining"]'),
};

module.exports = checkYourEmail;
