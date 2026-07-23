const newAccessCode = {
  visit: () => cy.visit('/login/new-access-code'),
  heading: () => cy.get('[data-cy="new-access-code-email-sent-heading"]'),
  description: () => cy.get('[data-cy="new-access-code-email-sent-description"]'),
  expiryInfo: () => cy.get('[data-cy="new-access-code-email-sent-expiry-info"]'),
  accessCodeInput: () => cy.get('[data-cy="access-code-input"]'),
  spamOrJunk: () => cy.get('[data-cy="access-code-spam-or-junk"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-suspend-info"]'),
  requestCodeLink: () => cy.get('[data-cy="request-code-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  inlineError: () => cy.get('[data-cy="six-digit-access-code-inline-error"]'),
  sixDigitAccessCodeLabel: () => cy.get('[data-cy="six-digit-access-code-label"]'),
  contactUsEmail: () => cy.get('[data-cy="contact-us-email"]'),
  contactUsTimeframe: () => cy.get('[data-cy="contact-us-timeframe"]'),
};

module.exports = newAccessCode;
