const accessCodeExpired = {
  heading: () => cy.get('[data-cy="access-code-expired-heading"]'),
  securityInfo: () => cy.get('[data-cy="access-code-expired-security-info"]'),
  attemptsInfo: () => cy.get('[data-cy="access-code-expired-attempts-info"]'),
  suspendInfo: () => cy.get('[data-cy="access-code-expired-suspend-info"]'),
  requestNewCodeButton: () => cy.get('[data-cy="submit-button"]'),
  clickRequestNewCode: () => accessCodeExpired.requestNewCodeButton().click(),
};

export default accessCodeExpired;
