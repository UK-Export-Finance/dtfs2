const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');
const { accessCodeExpired } = require('../../../../../pages');

context('2FA Page - Access code expired', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  it('should redirect to login when visited without partial auth', () => {
    accessCodeExpired.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should render expired page with heading and info', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.url().should('include', '/login/check-your-email-access-code');
    cy.visit('/login/access-code-expired');
    accessCodeExpired.heading().should('contain', 'Your access code has expired');
    accessCodeExpired.securityInfo().should('contain', 'For security, access codes expire after 30 minutes');
    accessCodeExpired.attemptsInfo().should('contain', 'You have');
    accessCodeExpired.attemptsInfo().should('contain', 'attempts remaining.');
    accessCodeExpired.suspendInfo().should('contain', 'If you request too many access codes your account will be suspended');
    accessCodeExpired.requestNewCodeButton().should('contain', 'Request a new code');
  });
});
