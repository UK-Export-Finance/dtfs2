const { signInLink, beforeYouStart, signInLinkExpired, checkYourEmail, landingPage } = require('../../pages');
const relative = require('../../relativeURL');
const { BANK1_MAKER1, BANK1_MAKER2 } = require('../../../../../e2e-fixtures');
const { SIGN_IN_TOKENS } = require('../../../fixtures/constants');

const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
const NOT_EXPIRED_SIGN_IN_TOKEN = {
  signInTokenFromLink: SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE,
  expiry: Date.now() + thirtyMinutesInMilliseconds,
};
const ANOTHER_NOT_EXPIRED_TOKEN = {
  signInTokenFromLink: SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_TWO,
  expiry: Date.now() + thirtyMinutesInMilliseconds,
};
const INVALID_SIGN_IN_TOKEN = {
  signInTokenFromLink: SIGN_IN_TOKENS.INVALID_FORMAT_SIGN_IN_TOKEN,
  expiry: Date.now() + thirtyMinutesInMilliseconds,
};
const EXPIRED_SIGN_IN_TOKEN = {
  signInTokenFromLink: SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_THREE,
  expiry: Date.now() - thirtyMinutesInMilliseconds,
};
const ANOTHER_EXPIRED_SIGN_IN_TOKEN = {
  signInTokenFromLink: SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_FOUR,
  expiry: Date.now() - thirtyMinutesInMilliseconds,
};

context('navigating using sign in link', () => {
  let bank1Maker1Id;
  const { username } = BANK1_MAKER1;

  let bank1Maker2Id;
  const { username: aDifferentUsername } = BANK1_MAKER2;

  beforeEach(() => {
    cy.getUserByUsername(username).then(({ _id }) => {
      bank1Maker1Id = _id;
    });

    cy.getUserByUsername(aDifferentUsername).then(({ _id }) => {
      bank1Maker2Id = _id;
    });
  });

  describe('When the user has entered username and password', () => {
    beforeEach(() => {
      cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });

    it('Opening a previously issued sign in link takes the user to the /login/sign-in-link-expired page to resend link and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({
        username,
        newSignInTokens: [EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN],
      });
      signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });

      linkShouldBeExpiredAndAbleToBeResent();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening a previously issued but not expired sign in link takes the user to the /login/sign-in-link-expired page to resend link and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({
        username,
        newSignInTokens: [ANOTHER_NOT_EXPIRED_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN],
      });
      signInLink.visit({ token: ANOTHER_NOT_EXPIRED_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });

      linkShouldBeExpiredAndAbleToBeResent();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening the most recently issued, but expired, sign in link takes the user to the /login/sign-in-link-expired page to resend link and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [EXPIRED_SIGN_IN_TOKEN] });
      signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });

      linkShouldBeExpiredAndAbleToBeResent();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening a sign in link with invalid token takes the user to the page not found page and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [INVALID_SIGN_IN_TOKEN] });
      signInLink.visit({ token: INVALID_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id }, { failOnStatusCode: false });
      signInLink.shouldDisplayProblemWithServiceError();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });
    it('Opening a sign in link with invalid username takes the user to the page not found page and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [NOT_EXPIRED_SIGN_IN_TOKEN] });
      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: 'notValidToken' }, { failOnStatusCode: false });
      signInLink.shouldDisplayProblemWithServiceError();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening a sign in link with non-matching user id takes the user to the page not found page and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [NOT_EXPIRED_SIGN_IN_TOKEN] });
      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker2Id }, { failOnStatusCode: false });
      signInLink.shouldDisplayProblemWithServiceError();

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening a valid sign in link takes the user to the /dashboard page and gives the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({
        username,
        newSignInTokens: [EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN],
      });

      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });
      cy.url().should('eq', relative('/dashboard/deals/0'));

      beforeYouStart.visit();
      cy.url().should('eq', relative('/before-you-start'));
    });

    it('Opening a valid sign in link when user is blocked takes the user to the user blocked page', () => {
      checkYourEmail.attemptsRemaining().should('contain', '2 attempts remaining');
      checkYourEmail.visit();
      checkYourEmail.sendNewSignInLink();

      checkYourEmail.attemptsRemaining().should('contain', '1 attempt remaining');
      checkYourEmail.visit();
      checkYourEmail.sendNewSignInLink();

      landingPage.visit();
      cy.enterUsernameAndPassword(BANK1_MAKER1);
      landingPage.accountSuspended().should('exist');

      cy.overridePortalUserSignInTokensByUsername({
        username,
        newSignInTokens: [ANOTHER_EXPIRED_SIGN_IN_TOKEN, EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN],
      });

      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id }, { failOnStatusCode: false });
      signInLink.shouldDisplayAccountSuspended();
    });

    it('Opening a valid sign in link when user is disabled takes the user to the user blocked page', () => {
      cy.disablePortalUserByUsername(username);

      cy.overridePortalUserSignInTokensByUsername({
        username,
        newSignInTokens: [NOT_EXPIRED_SIGN_IN_TOKEN],
      });

      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id }, { failOnStatusCode: false });
      signInLink.shouldDisplayAccountSuspended();
    });

    it('Opening a valid sign in link and logging in, then disabling the user and visiting the landing page will redirect the user to the login page', () => {
      cy.overridePortalUserSignInTokensByUsername({
        username: BANK1_MAKER1.username,
        newSignInTokens: [NOT_EXPIRED_SIGN_IN_TOKEN],
      });

      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id }, { failOnStatusCode: false });

      cy.disablePortalUserByUsername(username);

      landingPage.visit();

      cy.url().should('eq', relative('/login'));
    });
  });

  describe('When the user has not entered username and password', () => {
    beforeEach(() => {
      cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
    });

    it('Opening a valid sign in link without first entering the username and password redirects to the login page and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [NOT_EXPIRED_SIGN_IN_TOKEN] });

      signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });
      cy.url().should('eq', relative('/login'));

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });

    it('Opening an invalid sign in link takes the user to the /login page and does not give the user access to protected routes', () => {
      cy.overridePortalUserSignInTokensByUsername({ username, newSignInTokens: [INVALID_SIGN_IN_TOKEN] });
      signInLink.visit({ token: INVALID_SIGN_IN_TOKEN.signInTokenFromLink, userId: bank1Maker1Id });
      cy.url().should('eq', relative('/login'));

      checkUserDoesNotHaveAccessToProtectedRoutes();
    });
  });

  function linkShouldBeExpiredAndAbleToBeResent() {
    cy.url().should('eq', relative('/login/sign-in-link-expired'));
    signInLinkExpired.sendNewSignInLink();
    cy.url().should('eq', relative('/login/check-your-email'));
  }

  function checkUserDoesNotHaveAccessToProtectedRoutes() {
    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  }
});
