const { signInLink, beforeYouStart } = require('../../pages');
const relative = require('../../relativeURL');
const { BANK1_MAKER1 } = require('../../../../../e2e-fixtures');

const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
const NOT_EXPIRED_SIGN_IN_TOKEN = {
  signInTokenFromLink: '1111111111abcdef1111111111abcdef1111111111abcdef1111111111abcdef',
  expiry: Date.now() + thirtyMinutesInMilliseconds,
};
const ANOTHER_NOT_EXPIRED_TOKEN = {
  signInTokenFromLink: '4444444444abcdef4444444444abcdef4444444444abcdef4444444444abcdef',
  expiry: Date.now() + thirtyMinutesInMilliseconds,
};
const INVALID_SIGN_IN_TOKEN = { signInTokenFromLink: '2222222222abcdef2222222222abcdef', expiry: Date.now() + thirtyMinutesInMilliseconds };
const EXPIRED_SIGN_IN_TOKEN = {
  signInTokenFromLink: '3333333333abcdef3333333333abcdef3333333333abcdef3333333333abcdef',
  expiry: Date.now() - thirtyMinutesInMilliseconds,
};

context('navigating using sign in link', () => {
  let bank1Maker1Id;

  beforeEach(() => {
    const { username } = BANK1_MAKER1;
    cy.getUserByUsername(username).then(({ _id }) => {
      bank1Maker1Id = _id;
    });
  });

  describe('When the user has entered username and password', () => {
    beforeEach(() => {
      const { username } = BANK1_MAKER1;
      cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
      cy.enterUsernameAndPassword(BANK1_MAKER1);
    });
  });

  it.only('Opening a previously issued sign in link takes the user to the /login/sign-in-link-expired page and does not give the user access to protected routes', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN] });
    signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN] });
    signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued but not expired sign in link takes the user to the /login/sign-in-link-expired page and does not give the user access to protected routes', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [ANOTHER_NOT_EXPIRED_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN] });
    signInLink.visit({ token: ANOTHER_NOT_EXPIRED_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued but not expired sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [ANOTHER_NOT_EXPIRED_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN] });
    signInLink.visit({ token: ANOTHER_NOT_EXPIRED_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening the most recently issued, but expired, sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [EXPIRED_SIGN_IN_TOKEN] });
    signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening an invalid sign in link takes the user to the /login page and does not give the user access to protected routes', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [INVALID_SIGN_IN_TOKEN] });
    signInLink.visit({ token: INVALID_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a valid sign in link takes the user to the /dashboard page and gives the user access to protected routes', () => {
    cy.overridePortalUserSignInTokensByUsername({ username: BANK1_MAKER1.username, newSignInTokens: [EXPIRED_SIGN_IN_TOKEN, NOT_EXPIRED_SIGN_IN_TOKEN] });

    signInLink.visit({ token: NOT_EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/dashboard/deals/0'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/before-you-start'));
  });

  describe('When the user has not entered username and password', () => {
    beforeEach(() => {
      const { username } = BANK1_MAKER1;
      cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
    });

    it('Opening a valid sign in link without first entering the username and password redirects to the login page and does not give the user access to protected routes', () => {
      cy.overrideUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: NOT_EXPIRED_SIGN_IN_TOKEN });

      signInLink.visitWithToken(NOT_EXPIRED_SIGN_IN_TOKEN, { failOnStatusCode: false });
      signInLink.shouldDisplayProblemWithServiceError();

      beforeYouStart.visit();
      cy.url().should('eq', relative('/login'));
    });
  });
});
