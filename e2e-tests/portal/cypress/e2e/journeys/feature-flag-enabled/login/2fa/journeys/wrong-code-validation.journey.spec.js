const { checkYourEmailAccessCode, newAccessCode, resendAnotherAccessCode } = require('../../../../../pages');
const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const { PORTAL_2FA_ACCESS_CODE } = require('../../../../../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../access-code-form.shared-test');
const { errorSummary } = require('../../../../../partials');

const accessCodePages = [
  { name: 'check-your-email', count: 0, url: '/login/check-your-email-access-code', page: checkYourEmailAccessCode, wrongCode: '000000' },
  { name: 'new-access-code', count: 1, url: '/login/new-access-code', page: newAccessCode, wrongCode: '999999' },
  { name: 'resend-another-access-code', count: 2, url: '/login/resend-another-access-code', page: resendAnotherAccessCode, wrongCode: '111111' },
];

const visitAccessCodePage = ({ count, url }) => {
  cy.overridePortalUserSignInOTPSendCount({ username: BANK1_MAKER1.username, count });
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  cy.url().should('eq', relative(url));
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

  describe('Empty code validation', () => {
    accessCodePages.forEach(({ name, count, url, page }) => {
      it(`should show validation error when submitting an empty code on ${name}`, () => {
        visitAccessCodePage({ count, url });
        submitAccessCode(page);

        errorSummary().should('contain', 'Enter access code');
        cy.assertText(page.inlineError(), 'Error: Enter access code');

        cy.url().should('contain', url);
      });
    });
  });

  describe('Wrong code validation', () => {
    accessCodePages.forEach(({ name, count, url, page, wrongCode }) => {
      it(`should show the incorrect code error on ${name}`, () => {
        visitAccessCodePage({ count, url });
        submitAccessCode(page, wrongCode);

        errorSummary().should('exist');
        cy.assertText(page.inlineError(), 'Error: The access code you have entered is incorrect');

        cy.url().should('contain', url);
      });
    });
  });

  describe('Error summary behavior', () => {
    it('should display the error summary at the top of the page', () => {
      visitAccessCodePage(accessCodePages[0]);
      submitAccessCode(checkYourEmailAccessCode);

      errorSummary().should('be.visible');
      errorSummary().should('contain', 'There is a problem');
      errorSummary().find('a').should('have.attr', 'href').and('contain', '#');
    });
  });

  describe('Correcting errors and successful submission', () => {
    it('should allow successful login after correcting an incorrect access code', () => {
      visitAccessCodePage(accessCodePages[0]);
      submitAccessCode(checkYourEmailAccessCode, '000000');

      errorSummary().should('exist');

      cy.overridePortalUserSignInOTPWithValidTokenByUsername({ username: BANK1_MAKER1.username }).then(() => {
        submitAccessCode(checkYourEmailAccessCode, PORTAL_2FA_ACCESS_CODE);
      });

      cy.url().should('not.contain', '/login');
    });

    it('should allow successful login after correcting an empty access code', () => {
      visitAccessCodePage(accessCodePages[0]);
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
      visitAccessCodePage(accessCodePages[0]);

      ['111111', '222222', '333333'].forEach((wrongCode) => {
        submitAccessCode(checkYourEmailAccessCode, wrongCode);

        errorSummary().should('exist');
        cy.assertText(checkYourEmailAccessCode.inlineError(), 'Error: The access code you have entered is incorrect');
        cy.url().should('eq', relative('/login/check-your-email-access-code'));
      });
    });
  });

  describe('Form state after validation errors', () => {
    it('should preserve the entered access code after a validation error', () => {
      const wrongCode = '000000';

      visitAccessCodePage(accessCodePages[0]);
      submitAccessCode(checkYourEmailAccessCode, wrongCode);

      checkYourEmailAccessCode.accessCodeInput().should('have.value', wrongCode);
    });

    it('should maintain the session after a validation error', () => {
      visitAccessCodePage(accessCodePages[0]);
      submitAccessCode(checkYourEmailAccessCode);

      cy.getCookie('dtfs-session').should('exist');
    });
  });
});
