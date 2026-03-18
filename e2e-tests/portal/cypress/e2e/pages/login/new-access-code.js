const newAccessCode = {
  visit: () => cy.visit('/login/new-access-code'),
  heading: () => cy.get('[data-cy="new-access-code-email-sent-heading"]'),
  description: () => cy.get('[data-cy="new-access-code-email-sent-description"]'),
  expiryInfo: () => cy.get('[data-cy="new-access-code-email-sent-expiry-info"]'),
  accessCodeInput: () => cy.get('[data-cy="access-code-input"]'),
  spamOrJunk: () => cy.get('[data-cy="access-code-spam-or-junk"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-suspend-info"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  requestCodeLink: () => cy.get('[data-cy="request-code-link"]'),
  csrfToken: () => cy.get('[data-cy=csrf-input]').then((csrfInput) => csrfInput.attr('value')),
};

module.exports = newAccessCode;
