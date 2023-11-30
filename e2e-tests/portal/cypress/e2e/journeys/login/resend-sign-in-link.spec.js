const { checkYourEmail, signInLink, landingPage } = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const FIRST_SIGN_IN_TOKEN = '6569ca7a6fd828f925e07c6e';

const userAnonymisedEmailAddress = 'm***1@ukexportfinance.gov.uk';

context('Resending sign in links', () => {
  it('Viewing the /login/check-your-email page without logging in redirects you to the login page', () => {
    checkYourEmail.visit();
    cy.url().should('eq', relative('/login'));
  });

  context('After the user enters their username and password', () => {
    let bank1Maker1Id;

    beforeEach(() => {
      const { username } = BANK1_MAKER1;
      cy.getUserByUsername(username).then(({ _id }) => { bank1Maker1Id = _id; });
      cy.resetUserStatusAndNumberOfSignInLinks(username);
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('Resending a sign in link invalidates the previous link', () => {
      cy.overrideUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: FIRST_SIGN_IN_TOKEN });
      checkYourEmail.sendNewSignInLink();
      signInLink.visit({ token: FIRST_SIGN_IN_TOKEN, userId: bank1Maker1Id });
      cy.url().should('eq', relative('/login/sign-in-link-expired'));
    });

    it('The user can resend the sign in link at most 2 times', () => {
      checkYourEmail.sendNewSignInLink();
      checkYourEmail.sendNewSignInLink();
      checkYourEmail.sendNewSignInLinkButton().should('not.exist');

      // TODO DTFS2-6796: POST requests after the account is suspended now return a 200 response.
      // Record a valid CSRF token to be used in a direct POST request later
      // checkYourEmail.csrfToken().then((csrfToken) => {
      // sendRequestToSendNewSignInLink(csrfToken).then((response) => {
      // expect(response.status).to.eq(403);
      // });
      // });
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

    it('The user is blocked if they attempt to sign in after using all resend email attempts', () => {
      checkYourEmail.attemptsRemaining().should('contain', '2 attempts remaining');
      checkYourEmail.visit();
      checkYourEmail.sendNewSignInLink();

      checkYourEmail.visit();
      checkYourEmail.sendNewSignInLink();

      checkYourEmail.visit();
      landingPage.visit();
      cy.enterUsernameAndPassword(BANK1_MAKER1);

      landingPage.accountSuspended().should('exist');
      // TODO DTFS2-6796: Visiting checkYourEmail shows the last success message, not the account suspended page
      // checkYourEmail.visit();
      // checkYourEmail.accountSuspended().should('exist');
    });
  });
});
