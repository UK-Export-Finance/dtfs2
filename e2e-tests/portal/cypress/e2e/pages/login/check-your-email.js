const checkYourEmail = {
  visit: () => cy.visit('/login/check-your-email'),
  sendNewSignInLinkButton: () => cy.get('[data-cy="request-new-sign-in-link"]'),
  obscuredSignInLinkTargetEmailAddressText: () => cy.get('[data-cy="obscured-sign-in-link-target-email-address"]'),
  attemptsRemaining: () => cy.get('[data-cy="attempts-remaining"]'),
  sendNewSignInLink: () => checkYourEmail.sendNewSignInLinkButton().click(),
  csrfToken: () => cy.get('[data-cy=csrf-input]').then((csrfInput) => csrfInput.attr('value')),
};

module.exports = checkYourEmail;
