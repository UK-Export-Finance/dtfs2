const accessCodeExpired = {
  visit: () => cy.visit('/login/access-code-expired'),
  heading: () => cy.get('[data-cy="access-code-expired-heading"]'),
  securityInfo: () => cy.get('[data-cy="access-code-expired-security-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-expired-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-expired-suspend-info"]'),
};

module.exports = accessCodeExpired;
