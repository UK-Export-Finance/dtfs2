const { checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../2faPageHelpers');
const { errorSummary } = require('../../../../../partials');

/**
 * E2E Journey Test: Wrong Access Code Validation
 *
 * Tests validation behavior when users enter incorrect access codes:
 * - Empty code validation
 * - Wrong code validation
 * - Invalid format validation
 * - Error messages displayed correctly
 * - User remains on same page after validation error
 * - Successful submission after correcting errors
 */
context('2FA Journey - Wrong access code validation', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('Empty code validation', () => {
    it('should show validation error when submitting empty code on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
      checkYourEmailAccessCode.inlineError().should('contain', 'Enter access code');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });

    it('should show validation error when submitting empty code on new-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/new-access-code');

      newAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');
      newAccessCode.inlineError().should('exist');
      newAccessCode.inlineError().should('contain', 'Enter access code');
      cy.url().should('contain', '/login/new-access-code');
    });

    it('should show validation error when submitting empty code on resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      cy.url().should('contain', '/login/resend-another-access-code');

      resendAnotherAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');
      resendAnotherAccessCode.inlineError().should('exist');
      resendAnotherAccessCode.inlineError().should('contain', 'Enter access code');
      cy.url().should('contain', '/login/resend-another-access-code');
    });
  });

  describe('Wrong code validation', () => {
    it('should show error when submitting incorrect code on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
      checkYourEmailAccessCode.inlineError().should('contain', 'incorrect');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });

    it('should show error when submitting incorrect code on new-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 1 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      newAccessCode.accessCodeInput().clear();
      newAccessCode.accessCodeInput().type('999999');
      cy.get('form').submit();

      errorSummary().should('exist');
      newAccessCode.inlineError().should('exist');
      newAccessCode.inlineError().should('contain', 'incorrect');
      cy.url().should('contain', '/login/new-access-code');
    });

    it('should show error when submitting incorrect code on resend-another-access-code page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 2 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      resendAnotherAccessCode.accessCodeInput().clear();
      resendAnotherAccessCode.accessCodeInput().type('111111');
      cy.get('form').submit();

      errorSummary().should('exist');
      resendAnotherAccessCode.inlineError().should('exist');
      resendAnotherAccessCode.inlineError().should('contain', 'incorrect');
      cy.url().should('contain', '/login/resend-another-access-code');
    });
  });

  describe('Invalid format validation', () => {
    it('should show error for non-numeric code on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('abcdef');
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
    });

    it('should show error for too short code on check-your-email page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('12345');
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
    });

    it('should show error for code with special characters', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('123-456');
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
    });
  });

  describe('Error summary behavior', () => {
    it('should display error summary at top of page', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');
      errorSummary().should('be.visible');
      errorSummary().should('contain', 'There is a problem');
    });

    it('should link to the error field from error summary', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().find('a').should('have.attr', 'href').and('contain', '#');
    });

    it('should show both error summary and inline error', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');
      checkYourEmailAccessCode.inlineError().should('exist');
    });
  });

  describe('Correcting errors and successful submission', () => {
    it('should clear error and allow successful login after entering correct code', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      // Submit wrong code
      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('000000');
      cy.get('form').submit();

      errorSummary().should('exist');

      // Submit correct code
      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        checkYourEmailAccessCode.accessCodeInput().clear();
        cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
      });
    });

    it('should allow resubmission after correcting empty code error', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      // Submit empty code
      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');

      // Submit correct code
      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        cy.keyboardInput(checkYourEmailAccessCode.accessCodeInput(), PORTAL_2FA_ACCESS_CODE);
        cy.clickSubmitButton();

        cy.url().should('not.contain', '/login');
      });
    });
  });

  describe('Multiple wrong attempts', () => {
    it('should keep user on same page after multiple wrong attempts', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      // First wrong attempt
      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('111111');
      cy.get('form').submit();

      errorSummary().should('exist');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      // Second wrong attempt
      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type('222222');
      cy.get('form').submit();

      errorSummary().should('exist');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });

    it('should display consistent error message for multiple wrong attempts', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      for (let i = 0; i < 3; i += 1) {
        checkYourEmailAccessCode.accessCodeInput().clear();
        checkYourEmailAccessCode.accessCodeInput().type(`${i}${i}${i}${i}${i}${i}`);
        cy.get('form').submit();

        errorSummary().should('exist');
        checkYourEmailAccessCode.inlineError().should('contain', 'incorrect');
      }
    });
  });

  describe('Form state after validation errors', () => {
    it('should preserve input value after validation error', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      const wrongCode = '000000';

      checkYourEmailAccessCode.accessCodeInput().clear();
      checkYourEmailAccessCode.accessCodeInput().type(wrongCode);
      cy.get('form').submit();

      checkYourEmailAccessCode.accessCodeInput().should('have.value', wrongCode);
    });

    it('should maintain CSRF token after validation error', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      errorSummary().should('exist');

      checkYourEmailAccessCode.csrfToken().then((token) => {
        expect(token).to.be.a('string');
        expect(token).to.not.equal('');
      });
    });

    it('should maintain session after validation error', () => {
      cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 0 });
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      checkYourEmailAccessCode.accessCodeInput().clear();
      cy.get('form').submit();

      cy.getCookie('dtfs-session').should('exist');
    });
  });

  describe('Cross-page validation consistency', () => {
    it('should show consistent error messages across all 2FA pages', () => {
      const pages = [
        {
          count: 0,
          url: '/login/check-your-email-access-code',
          input: () => checkYourEmailAccessCode.accessCodeInput(),
          inlineError: () => checkYourEmailAccessCode.inlineError(),
        },
        {
          count: 1,
          url: '/login/new-access-code',
          input: () => newAccessCode.accessCodeInput(),
          inlineError: () => newAccessCode.inlineError(),
        },
        {
          count: 2,
          url: '/login/resend-another-access-code',
          input: () => resendAnotherAccessCode.accessCodeInput(),
          inlineError: () => resendAnotherAccessCode.inlineError(),
        },
      ];

      pages.forEach(({ count, url, input, inlineError }) => {
        cy.resetPortalUserStatusAndNumberOfSignInOTPs(BANK1_MAKER1.username);
        cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count });
        cy.enterUsernameAndPassword(BANK1_MAKER1);

        cy.url().should('contain', url);

        input().clear();
        cy.get('form').submit();

        errorSummary().should('exist');
        inlineError().should('contain', 'Enter access code');
      });
    });
  });
});
