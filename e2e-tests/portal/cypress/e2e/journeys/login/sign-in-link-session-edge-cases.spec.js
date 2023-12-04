const { signInLink, header, userProfile } = require('../../pages');
const relative = require('../../relativeURL');
const { BANK1_MAKER1, BANK1_MAKER2 } = require('../../../../../e2e-fixtures');

const SIGN_IN_TOKEN = '6569ca7a6fd828f925e07c6e';

context('Sign in link session edge cases', () => {
  let bank1Maker1Id;

  beforeEach(() => {
    const { username } = BANK1_MAKER1;
    cy.getUserByUsername(username).then(({ _id }) => {
      bank1Maker1Id = _id;
    });
    cy.resetUserStatusAndNumberOfSignInLinks(username);
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.overrideUserSignInTokenByUsername({ username, newSignInToken: SIGN_IN_TOKEN });
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
});
