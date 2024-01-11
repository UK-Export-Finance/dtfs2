const { signInLink, beforeYouStart } = require('../../pages');
const relative = require('../../relativeURL');
const { BANK1_MAKER1 } = require('../../../../../e2e-fixtures');

const SIGN_IN_TOKEN = '1111111111abcdef1111111111abcdef1111111111abcdef1111111111abcdef';
const INVALID_SIGN_IN_TOKEN = '6569ca7a6fd828f925e07999';
const EXPIRED_SIGN_IN_TOKEN = 'TO ADD';
const PREVIOUSLY_ISSUED_NOT_EXPIRED_TOKEN = 'TO ADD';

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
      cy.overridePortalUserSignInTokenByUsername({ username, newSignInToken: SIGN_IN_TOKEN });
    });
  });

  it('Opening a previously issued sign in link takes the user to the /login/sign-in-link-expired page and does not give the user access to protected routes', () => {
    signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    signInLink.visit({ token: EXPIRED_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued but not expired sign in link takes the user to the /login/sign-in-link-expired page and does not give the user access to protected routes', () => {
    signInLink.visit({ token: PREVIOUSLY_ISSUED_NOT_EXPIRED_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a previously issued but not expired sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    signInLink.visit({ token: PREVIOUSLY_ISSUED_NOT_EXPIRED_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening the most recently issued, but expired, sign in link takes the user to the /login/sign-in-link-expired page and allows the user to resent the link', () => {
    signInLink.visit({ token: PREVIOUSLY_ISSUED_NOT_EXPIRED_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening an invalid sign in link takes the user to the /login page and does not give the user access to protected routes', () => {
    signInLink.visit({ token: INVALID_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a valid sign in link takes the user to the /dashboard page and gives the user access to protected routes', () => {
    cy.overridePortalUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: SIGN_IN_TOKEN });

    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/dashboard/deals/0'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/before-you-start'));
  });

  describe('When the user has not entered username and password', () => {
    beforeEach(() => {
      const { username } = BANK1_MAKER1;
      cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
      cy.overridePortalUserSignInTokenByUsername({ username, newSignInToken: SIGN_IN_TOKEN });
    });

    it('Opening a valid sign in link without first entering the username and password redirects to the login page and does not give the user access to protected routes', () => {
      cy.overrideUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: SIGN_IN_TOKEN });

      signInLink.visitWithToken(SIGN_IN_TOKEN, { failOnStatusCode: false });
      signInLink.shouldDisplayProblemWithServiceError();

      beforeYouStart.visit();
      cy.url().should('eq', relative('/login'));
    });
  });
});
