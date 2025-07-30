const { signInLink } = require('../../../e2e/pages');
const relative = require('../../relativeURL');
const { SIGN_IN_TOKENS } = require('../../../fixtures/constants');

const login = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  cy.enterUsernameAndPassword({ username, password });

  cy.url().should('eq', relative('/login/check-your-email'));

  const signInToken = SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;

  cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id }) => {
    signInLink.visit({ token: signInToken, userId: _id });
  });
};

export default login;
