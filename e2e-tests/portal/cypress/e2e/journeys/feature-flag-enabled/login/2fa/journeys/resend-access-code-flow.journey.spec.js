const { checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');

const enterJourneyAtSendCount = (count) => {
  cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count });
  cy.enterUsernameAndPassword(BANK1_MAKER1);
};

const submitValidAccessCode = (page) => {
  cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
    cy.keyboardInput(page.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
    cy.clickSubmitButton();
  });
};

context('2FA Journey - Resend access code flow', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  it('should move from check-your-email to new-access-code when requesting the first new code', () => {
    enterJourneyAtSendCount(0);

    cy.url().should('eq', relative('/login/check-your-email-access-code'));
    cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');

    checkYourEmailAccessCode.requestCodeLink().click();

    cy.url().should('contain', '/login/new-access-code');
    cy.assertText(newAccessCode.heading(), 'New access code sent');
  });

  it('should move from new-access-code to resend-another-access-code when requesting another code', () => {
    enterJourneyAtSendCount(1);

    cy.url().should('contain', '/login/new-access-code');
    cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');

    newAccessCode.requestCodeLink().click();

    cy.url().should('contain', '/login/resend-another-access-code');
    cy.assertText(resendAnotherAccessCode.heading(), "We've sent you another access code");
  });

  it('should end the resend flow on resend-another-access-code with no further request link', () => {
    enterJourneyAtSendCount(2);

    cy.url().should('contain', '/login/resend-another-access-code');

    cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
    cy.assertText(resendAnotherAccessCode.supportInfo(), 'If you are still having problems signing in, contact us for support.');
    cy.get('[data-cy="request-code-link"]').should('not.exist');
  });

  it('should allow successful login from the new-access-code page', () => {
    enterJourneyAtSendCount(1);
    submitValidAccessCode(newAccessCode);

    cy.url().should('not.contain', '/login');
  });

  it('should allow successful login from the resend-another-access-code page', () => {
    enterJourneyAtSendCount(2);
    submitValidAccessCode(resendAnotherAccessCode);

    cy.url().should('not.contain', '/login');
  });

  it('should progress through the full resend journey with the expected attempts remaining', () => {
    enterJourneyAtSendCount(0);

    cy.url().should('eq', relative('/login/check-your-email-access-code'));
    cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
    checkYourEmailAccessCode.requestCodeLink().click();

    cy.url().should('contain', '/login/new-access-code');
    cy.assertText(newAccessCode.attemptsInfo(), 'You have 1 attempts remaining.');
    newAccessCode.requestCodeLink().click();

    cy.url().should('contain', '/login/resend-another-access-code');
    cy.assertText(resendAnotherAccessCode.attemptsInfo(), 'You have 0 attempts remaining.');
  });
});
