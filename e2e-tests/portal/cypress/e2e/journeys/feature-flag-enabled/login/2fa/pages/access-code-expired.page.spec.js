const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');
const { accessCodeExpired, checkYourEmailAccessCode } = require('../../../../../pages');

context('2FA Page - Access code expired', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
  });

  it('should redirect to login when visited without partial auth', () => {
    accessCodeExpired.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should render expired page with heading and info after submitting expired code', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.url().should('include', '/login/check-your-email-access-code');

    // Set expired OTP in database
    cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username: BANK1_MAKER1.username });

    // Enter the expired access code
    cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();

    // App should detect expiry and redirect
    cy.url().should('eq', relative('/login/access-code-expired'));

    cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
    cy.assertText(
      accessCodeExpired.securityInfo(),
      'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
    );
    accessCodeExpired.attemptsInfo().should('contain', 'You have');
    accessCodeExpired.attemptsInfo().should('contain', 'attempts remaining.');
    cy.assertText(
      accessCodeExpired.suspendInfo(),
      'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
    );
    cy.assertText(accessCodeExpired.requestNewCodeButton(), 'Request a new code');
  });
});
