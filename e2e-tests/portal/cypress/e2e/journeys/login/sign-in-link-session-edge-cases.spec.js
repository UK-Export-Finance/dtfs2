const {
  signInLink, header, userProfile, checkYourEmail, signInLinkExpired, landingPage,
} = require('../../pages');
const relative = require('../../relativeURL');
const { BANK1_MAKER1, BANK1_MAKER2 } = require('../../../../../e2e-fixtures');

const SIGN_IN_TOKEN = '1111111111abcdef1111111111abcdef1111111111abcdef1111111111abcdef';

context('Sign in link session edge cases', () => {
  let bank1Maker1Id;

  beforeEach(() => {
    const { username } = BANK1_MAKER1;
    cy.getUserByUsername(username).then(({ _id }) => {
      bank1Maker1Id = _id;
    });
    cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.overridePortalUserSignInTokenByUsername({ username, newSignInToken: SIGN_IN_TOKEN });
  });

  it('Logs the user in with the user associated with the sign in link after they have not sent any sign in link in the current session', () => {
    cy.clearCookies();

    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('Logs the user in with the user associated with the sign in link after they have sent the sign in link in the current session', () => {
    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('Logs the user in with the user associated with the sign in link after they have sent a different sign in link for a different user in the same session', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER2);

    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });

    cy.url().should('eq', relative('/dashboard/deals/0'));
    header.profile().click();
    userProfile.email().should('have.text', BANK1_MAKER1.username);
  });

  it('The user cannot use the last valid sign in token after they are blocked', () => {
    checkYourEmail.attemptsRemaining().should('contain', '2 attempts remaining');
    checkYourEmail.visit();
    checkYourEmail.sendNewSignInLink();

    checkYourEmail.attemptsRemaining().should('contain', '1 attempt remaining');
    checkYourEmail.visit();
    checkYourEmail.sendNewSignInLink();

    cy.overridePortalUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: SIGN_IN_TOKEN });

    landingPage.visit();
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    landingPage.accountSuspended().should('exist');

    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));
    signInLinkExpired.sendNewSignInLink();
  });
});
