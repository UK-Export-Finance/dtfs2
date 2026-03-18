const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('./2faPageHelpers');
const { accessCodeExpired } = require('../../../../../pages');

context('2FA Page - Access code expired', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  // TODO-8265: these tests will be enabled once the 8222 PR is merged which adds the mechanism to trigger OTP expiry.
  it.skip('should redirect to login when visited without partial auth', () => {
    accessCodeExpired.visit();
    cy.url().should('eq', relative('/login'));
  });

  it.skip('should render expired page with heading and info', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.visit('/login/access-code-expired');
    cy.get('[data-cy="access-code-expired-heading"]').should('exist');
    cy.get('[data-cy="access-code-expired-security-info"]').should('contain', 'expire');
    cy.get('[data-cy="access-code-expired-attempts-info"]').should('exist');
    cy.get('[data-cy="access-code-expired-suspend-info"]').should('exist');
    cy.get('[data-cy="submit-button"]').should('exist');
  });
});
