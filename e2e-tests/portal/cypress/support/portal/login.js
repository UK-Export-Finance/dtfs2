const { signInLink } = require('../../e2e/pages');
const relative = require('../../e2e/relativeURL');
const { SIGN_IN_TOKENS } = require('../../fixtures/constants');

const PORTAL_2FA_FF = Cypress.env('FF_PORTAL_2FA_ENABLED');

module.exports = ({ username, password }) => {
  if (PORTAL_2FA_FF === 'true') {
    cy.loginOTP({ username, password });
  } else {
    cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
    cy.enterUsernameAndPassword({ username, password });

    cy.url().should('eq', relative('/login/check-your-email'));

    const signInToken = SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;

    cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
    cy.getUserByUsername(username).then(({ _id }) => {
      signInLink.visit({ token: signInToken, userId: _id });
    });
  }
};
