const checkYourEmailAccessCode = {
  visit: () => cy.visit('/login/check-your-email-access-code'),
  heading: () => cy.get('[data-cy="check-your-email-heading"]'),
  description: () => cy.get('[data-cy="check-your-email-description"]'),
  expiryInfo: () => cy.get('[data-cy="access-code-expiry-info"]'),
  spamOrJunk: () => cy.get('[data-cy="access-code-spam-or-junk"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-suspend-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-attempts-info"]'),
  requestCodeLink: () => cy.get('[data-cy="request-code-link"]'),
  csrfToken: () => cy.get('[data-cy=csrf-input]').then((csrfInput) => csrfInput.attr('value')),
  accessCodeInput: () => cy.get('[data-cy="access-code-input"]'),
  inlineError: () => cy.get('[data-cy="six-digit-access-code-inline-error"]'),
  sixDigitAccessCodeLabel: () => cy.get('[data-cy="six-digit-access-code-label"]'),
};

module.exports = checkYourEmailAccessCode;
