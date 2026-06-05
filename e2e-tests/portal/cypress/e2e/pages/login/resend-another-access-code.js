const resendAnotherAccessCode = {
  visit: () => cy.visit('/login/resend-another-access-code'),
  heading: () => cy.get('[data-cy="resend-another-access-code-email-sent-heading"]'),
  description: () => cy.get('[data-cy="resend-another-access-code-email-sent-description"]'),
  expiryInfo: () => cy.get('[data-cy="resend-another-access-code-email-sent-expiry-info"]'),
  accessCodeInput: () => cy.get('[data-cy="access-code-input"]'),
  spamOrJunk: () => cy.get('[data-cy="access-code-spam-or-junk"]'),
  supportInfo: () => cy.get('[data-cy="access-code-support-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-suspend-info"]'),
  obscuredEmail: () => cy.get('[data-cy="obscured-sign-in-link-target-email-address"]'),
  inlineError: () => cy.get('[data-cy="six-digit-access-code-inline-error"]'),
  sixDigitAccessCodeLabel: () => cy.get('[data-cy="six-digit-access-code-label"]'),
  contactUsEmail: () => cy.get('[data-cy="contact-us-email"]'),
  contactUsTimeframe: () => cy.get('[data-cy="contact-us-timeframe"]'),
};

module.exports = resendAnotherAccessCode;
