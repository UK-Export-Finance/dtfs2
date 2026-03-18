const resendAnotherAccessCode = {
  visit: () => cy.visit('/login/resend-another-access-code'),
  heading: () => cy.get('[data-cy="resend-another-access-code-email-sent-heading"]'),
  description: () => cy.get('[data-cy="resend-another-access-code-email-sent-description"]'),
  expiryInfo: () => cy.get('[data-cy="resend-another-access-code-email-sent-expiry-info"]'),
  sixDigitInput: () => cy.get('[data-cy="six-digit-access-code-input"]'),
  spamOrJunk: () => cy.get('[data-cy="access-code-spam-or-junk"]'),
  supportInfo: () => cy.get('[data-cy="access-code-support-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-suspend-info"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  requestNewSignInLink: () => cy.get('[data-cy="request-new-sign-in-link"]'),
  obscuredEmail: () => cy.get('[data-cy="obscured-sign-in-link-target-email-address"]'),
  csrfToken: () => cy.get('[data-cy=csrf-input]').then((csrfInput) => csrfInput.attr('value')),
};

module.exports = resendAnotherAccessCode;
