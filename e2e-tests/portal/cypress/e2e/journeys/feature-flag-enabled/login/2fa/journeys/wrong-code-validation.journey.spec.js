const { checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');
const { errorSummary } = require('../../../../../partials');

const visitCheckYourEmailPage = () => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('eq', relative('/login/check-your-email-access-code'));
};

const visitNewAccessCodePage = () => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);
  checkYourEmailAccessCode.requestCodeLink().click();

  cy.url().should('eq', relative('/login/new-access-code'));
};

const visitResendAnotherAccessCodePage = () => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);
  checkYourEmailAccessCode.requestCodeLink().click();
  newAccessCode.requestCodeLink().click();

  cy.url().should('eq', relative('/login/resend-another-access-code'));
};

const submitAccessCode = (page, code) => {
  page.accessCodeInput().clear();

  if (code) {
    cy.keyboardInput(page.accessCodeInput(), code);
  }

  cy.clickSubmitButton();
};

context('2FA Journey - Wrong access code validation', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('Empty code validation on check-your-email-access-code page', () => {
    it('should show validation error when submitting an empty code', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode);

      errorSummary().should('contain', 'Enter access code');
      cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: Enter access code');
      cy.url().should('contain', '/login/check-your-email-access-code');
    });
  });

  describe('Empty code validation on new-access-code page', () => {
    it('should show validation error when submitting an empty code', () => {
      visitNewAccessCodePage();
      submitAccessCode(newAccessCode);

      errorSummary().should('contain', 'Enter access code');
      cy.assertText(newAccessCode.inlineError(), 'Error: Enter access code');
      cy.url().should('contain', '/login/new-access-code');
    });
  });

  describe('Empty code validation on resend-another-access-code page', () => {
    it('should show validation error when submitting an empty code', () => {
      visitResendAnotherAccessCodePage();
      submitAccessCode(resendAnotherAccessCode);

      errorSummary().should('contain', 'Enter access code');
      cy.assertText(resendAnotherAccessCode.inlineError(), 'Error: Enter access code');
      cy.url().should('contain', '/login/resend-another-access-code');
    });
  });

  describe('Wrong code validation on check-your-email-access-code page', () => {
    it('should show the incorrect code error', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode, '000000');

      errorSummary().should('exist');
      cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('contain', '/login/check-your-email-access-code');
    });
  });

  describe('Wrong code validation on new-access-code page', () => {
    it('should show the incorrect code error', () => {
      visitNewAccessCodePage();
      submitAccessCode(newAccessCode, '999999');

      errorSummary().should('exist');
      cy.assertText(newAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('contain', '/login/new-access-code');
    });
  });

  describe('Wrong code validation on resend-another-access-code page', () => {
    it('should show the incorrect code error', () => {
      visitResendAnotherAccessCodePage();
      submitAccessCode(resendAnotherAccessCode, '111111');

      errorSummary().should('exist');
      cy.assertText(resendAnotherAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('contain', '/login/resend-another-access-code');
    });
  });

  describe('Error summary behavior', () => {
    it('should display the error summary at the top of the page', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode);

      errorSummary().should('be.visible');
      errorSummary().should('contain', 'There is a problem');
      errorSummary().find('a').should('have.attr', 'href').and('contain', '#');
    });
  });

  describe('Correcting errors and successful submission', () => {
    it('should allow successful login after correcting an incorrect access code', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode, '000000');

      errorSummary().should('exist');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        submitAccessCode(checkYourEmailAccessCode, PORTAL_2FA_ACCESS_CODE);
      });

      cy.url().should('not.contain', '/login');
    });

    it('should allow successful login after correcting an empty access code', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode);

      errorSummary().should('exist');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        submitAccessCode(checkYourEmailAccessCode, PORTAL_2FA_ACCESS_CODE);
      });

      cy.url().should('not.contain', '/login');
    });
  });

  describe('Multiple wrong attempts', () => {
    it('should keep the user on the same page with a consistent error message after multiple wrong attempts', () => {
      visitCheckYourEmailPage();

      submitAccessCode(checkYourEmailAccessCode, '111111');
      errorSummary().should('exist');
      cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      submitAccessCode(checkYourEmailAccessCode, '222222');
      errorSummary().should('exist');
      cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));

      submitAccessCode(checkYourEmailAccessCode, '333333');
      errorSummary().should('exist');
      cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
      cy.url().should('eq', relative('/login/check-your-email-access-code'));
    });
  });

  describe('Form state after validation errors', () => {
    it('should preserve the entered access code after a validation error', () => {
      const wrongCode = '000000';

      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode, wrongCode);

      checkYourEmailAccessCode.accessCodeInput().should('have.value', wrongCode);
    });

    it('should maintain the session after a validation error', () => {
      visitCheckYourEmailPage();
      submitAccessCode(checkYourEmailAccessCode);

      cy.getCookie('dtfs-session').should('exist');
    });
  });
});
