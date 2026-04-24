const { accessCodeExpired, newAccessCode, checkYourEmailAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const expiredAttemptScenarios = [
  { count: 0, expectedAttempts: 'You have 2 attempts remaining.' },
  { count: 1, expectedAttempts: 'You have 1 attempts remaining.' },
  { count: 2, expectedAttempts: 'You have 0 attempts remaining.' },
];

/**
 * Maps OTP send count to the page the user lands on after login.
 * Login sends one OTP which increments the count by 1:
 *   count 0 → count becomes 1 → attemptsLeft 2 → check-your-email-access-code
 *   count 1 → count becomes 2 → attemptsLeft 1 → new-access-code
 *   count 2 → count becomes 3 → attemptsLeft 0 → resend-another-access-code
 */
const accessCodePageByCount = {
  0: { url: '/login/check-your-email-access-code', page: checkYourEmailAccessCode },
  1: { url: '/login/new-access-code', page: newAccessCode },
  2: { url: '/login/resend-another-access-code', page: resendAnotherAccessCode },
};

const submitExpiredAccessCode = (count = 0) => {
  const { url, page } = accessCodePageByCount[count];

  cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count });
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('contain', url);

  cy.overridePortalUserSignInOTPWithExpiredToken({ username: BANK1_MAKER1.username });
  cy.keyboardInput(page.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
  cy.clickSubmitButton();

  cy.url().should('eq', relative('/login/access-code-expired'));
};

context('2FA Journey - Access code expiry', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should redirect to login when accessing the expired page without partial auth', () => {
    accessCodeExpired.visit();

    cy.url().should('eq', relative('/login'));
  });

  it('should redirect to access-code-expired when submitting an expired access code', () => {
    submitExpiredAccessCode();

    cy.assertText(accessCodeExpired.heading(), 'Your access code has expired');
    cy.assertText(
      accessCodeExpired.securityInfo(),
      'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.',
    );
    cy.assertText(
      accessCodeExpired.suspendInfo(),
      'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
    );
    cy.assertText(accessCodeExpired.requestNewCodeButton(), 'Request a new code');
  });

  expiredAttemptScenarios.forEach(({ count, expectedAttempts }) => {
    it(`should show ${expectedAttempts} after expiry when the OTP send count starts at ${count}`, () => {
      submitExpiredAccessCode(count);

      cy.assertText(accessCodeExpired.attemptsInfo(), expectedAttempts);
    });
  });

  it('should allow requesting a new code from the expired page and land on new-access-code', () => {
    submitExpiredAccessCode(0);
    accessCodeExpired.requestNewCodeButton().click();

    cy.url().should('contain', '/login/new-access-code');
  });

  it('should land on resend-another-access-code when requesting a new code with one send already used', () => {
    submitExpiredAccessCode(1);
    accessCodeExpired.requestNewCodeButton().click();

    cy.url().should('contain', '/login/resend-another-access-code');
  });

  it('should allow successful login after requesting a new code from the expired page', () => {
    submitExpiredAccessCode(0);
    accessCodeExpired.requestNewCodeButton().click();

    cy.url().should('contain', '/login/new-access-code');

    cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
      cy.keyboardInput(newAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
      cy.clickSubmitButton();
    });

    cy.url().should('not.contain', '/login');
  });

  it('should keep the partial auth session after redirecting to the expired page', () => {
    submitExpiredAccessCode();

    cy.getCookie('dtfs-session').should('exist');
  });
});
