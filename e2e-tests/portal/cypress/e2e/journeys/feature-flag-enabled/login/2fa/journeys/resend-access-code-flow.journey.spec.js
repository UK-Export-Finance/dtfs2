const { checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');

/**
 * E2E Journey Test: Resend Access Code Flow
 *
 * Tests the complete flow of requesting new access codes:
 * - Requesting first new code (check-your-email -> new-access-code)
 * - Requesting second new code (new-access-code -> resend-another-access-code)
 * - Attempts remaining counter decrements correctly
 * - Successfully logging in after requesting new codes
 */
context('2FA Journey - Resend access code flow', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('First code sent - check-your-email page', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should land on check-your-email page after first login', () => {
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      checkYourEmailAccessCode.heading().should('exist');
    });

    it('should show 2 attempts remaining on check-your-email page', () => {
      checkYourEmailAccessCode.attemptsInfo().should('contain', '2');
    });

    it('should display request new code link on check-your-email page', () => {
      checkYourEmailAccessCode.requestCodeLink().should('exist');
      checkYourEmailAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
    });

    it('should navigate to new-access-code page when requesting new code', () => {
      checkYourEmailAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/new-access-code');
      newAccessCode.heading().should('exist');
    });
  });

  describe('Second code sent - new-access-code page', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should land on new-access-code page after second code request', () => {
      cy.url().should('contain', '/login/new-access-code');
      newAccessCode.heading().should('exist');
    });

    it('should show 1 attempt remaining on new-access-code page', () => {
      newAccessCode.attemptsInfo().should('contain', '1');
    });

    it('should display request new code link on new-access-code page', () => {
      newAccessCode.requestCodeLink().should('exist');
      newAccessCode.requestCodeLink().should('have.attr', 'href', '/login/request-new-access-code');
    });

    it('should navigate to resend-another-access-code page when requesting another code', () => {
      newAccessCode.requestCodeLink().click();

      cy.url().should('contain', '/login/resend-another-access-code');
      resendAnotherAccessCode.heading().should('exist');
    });

    it('should successfully login with valid code from new-access-code page', () => {
      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(newAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
      });
    });
  });

  describe('Third code sent - resend-another-access-code page', () => {
    beforeEach(() => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('should land on resend-another-access-code page after third code request', () => {
      cy.url().should('contain', '/login/resend-another-access-code');
      resendAnotherAccessCode.heading().should('exist');
    });

    it('should show 0 attempts remaining on resend-another-access-code page', () => {
      resendAnotherAccessCode.attemptsInfo().should('contain', '0');
    });

    it('should not display request new code link on resend-another-access-code page', () => {
      cy.get('[data-cy="request-code-link"]').should('not.exist');
    });

    it('should display support information on final resend page', () => {
      resendAnotherAccessCode.supportInfo().should('exist');
      cy.get('[data-cy="contact-us-email"]')
        .should('exist')
        .and('have.attr', 'href')
        .and('match', /^mailto:/);
    });

    it('should successfully login with valid code from resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(resendAnotherAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
      });
    });
  });

  describe('Complete resend journey from start to finish', () => {
    it('should progress through all resend pages correctly', () => {
      // Start with count 0
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      // First page: check-your-email (2 attempts remaining)
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
      checkYourEmailAccessCode.attemptsInfo().should('contain', '2');

      // Request new code
      checkYourEmailAccessCode.requestCodeLink().click();

      // Second page: new-access-code (1 attempt remaining)
      cy.url().should('contain', '/login/new-access-code');
      newAccessCode.attemptsInfo().should('contain', '1');

      // Request another code
      newAccessCode.requestCodeLink().click();

      // Third page: resend-another-access-code (0 attempts remaining)
      cy.url().should('contain', '/login/resend-another-access-code');
      resendAnotherAccessCode.attemptsInfo().should('contain', '0');

      // No more request link
      cy.get('[data-cy="request-code-link"]').should('not.exist');
    });

    it('should allow login from any stage of the resend flow', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/new-access-code');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(newAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
        cy.url().should('match', /\/(dashboard|deals|contracts)/);
      });
    });
  });

  describe('Email display across resend pages', () => {
    it('should display masked email on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.description().should('contain', '@');
    });

    it('should display masked email on new-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.description().should('contain', '@');
    });

    it('should display masked email on resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      resendAnotherAccessCode.description().should('contain', '@');
    });
  });

  describe('Expiry information across resend pages', () => {
    it('should display expiry info on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.expiryInfo().should('exist');
    });

    it('should display expiry info on new-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.expiryInfo().should('exist');
    });

    it('should display expiry info on resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      resendAnotherAccessCode.expiryInfo().should('exist');
    });
  });

  describe('Spam/junk advice across resend pages', () => {
    it('should display spam/junk advice on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.spamOrJunk().should('exist');
    });

    it('should display spam/junk advice on new-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.spamOrJunk().should('exist');
    });

    it('should display spam/junk advice on resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      resendAnotherAccessCode.spamOrJunk().should('exist');
    });
  });
});
