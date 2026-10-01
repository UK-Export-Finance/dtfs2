const { signInLink } = require('../../../e2e/pages');
const relative = require('../../relativeURL');
const { SIGN_IN_TOKENS } = require('../../../fixtures/constants');

const PORTAL_2FA_FF = Cypress.expose('FF_PORTAL_2FA_ENABLED');

const login = ({ username, password }) => {
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

  // The successful login response uses a meta refresh. Wait for it to finish
  // before another visit can replace the transitional login page.
  cy.url().should('not.include', '/login');
};

export default login;
