const { checkYourEmail, signInLink } = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const FIRST_SIGN_IN_TOKEN = 'test-token';

const userAnonymisedEmailAddress = 'm***1@ukexportfinance.gov.uk';

context('Resending sign in links', () => {
  if (!Cypress.env('DTFS_FF_MAGIC_LINK')) {
    return;
  }

  it('Viewing the /login/check-your-email page without logging in redirects you to the login page', () => {
    checkYourEmail.visit();
    cy.url().should('eq', relative('/login'));
  });

  context('After the user enters their username and password', () => {
    beforeEach(() => {
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('Resending a sign in link invalidates the previous link', () => {
      cy.overrideUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: FIRST_SIGN_IN_TOKEN });
      checkYourEmail.sendNewSignInLink();
      signInLink.visitWithToken(FIRST_SIGN_IN_TOKEN);
      cy.url().should('eq', relative('/login/sign-in-link-expired'));
    });

    it('The user can resend the sign in link at most 2 times', () => {
      checkYourEmail.sendNewSignInLink();
      // Record a valid CSRF token to be used in a direct POST request later
      checkYourEmail.csrfToken().then((csrfToken) => {
        checkYourEmail.sendNewSignInLink();
        checkYourEmail.sendNewSignInLinkButton().should('not.exist');
        sendRequestToSendNewSignInLink(csrfToken).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it('The user is shown the email address that sign in links are being sent to after resending the link 2 times', () => {
      checkYourEmail.sendNewSignInLink();
      checkYourEmail.sendNewSignInLink();
      checkYourEmail.obscuredSignInLinkTargetEmailAddressText().should('contain', userAnonymisedEmailAddress);
    });

    it('The session remembers how many sign in attempts are remaining', () => {
      checkYourEmail.attemptsRemaining().should('contain', '2 attempts remaining');
      checkYourEmail.visit();
      checkYourEmail.attemptsRemaining().should('contain', '2 attempts remaining');

      checkYourEmail.sendNewSignInLink();
      checkYourEmail.attemptsRemaining().should('contain', '1 attempt remaining');
      checkYourEmail.visit();
      checkYourEmail.attemptsRemaining().should('contain', '1 attempt remaining');

      checkYourEmail.sendNewSignInLink();
      checkYourEmail.attemptsRemaining().should('not.exist');
      checkYourEmail.sendNewSignInLinkButton().should('not.exist');
      checkYourEmail.visit();
      checkYourEmail.attemptsRemaining().should('not.exist');
      checkYourEmail.sendNewSignInLinkButton().should('not.exist');
    });
  });
});

function sendRequestToSendNewSignInLink(csrfToken) {
  return cy.request({
    method: 'POST',
    url: relative('/login/check-your-email'),
    body: {
      _csrf: csrfToken,
    },
    failOnStatusCode: false,
  });
}
