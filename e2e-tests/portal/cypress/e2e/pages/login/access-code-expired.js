const accessCodeExpired = {
  heading: () => cy.get('[data-cy="access-code-expired-heading"]'),
  securityInfo: () => cy.get('[data-cy="access-code-expired-security-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-expired-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-expired-suspend-info"]'),
  requestNewCodeButton: () => cy.get('[data-cy="access-code-expired-request-new-code"]'),
};

export default accessCodeExpired;
