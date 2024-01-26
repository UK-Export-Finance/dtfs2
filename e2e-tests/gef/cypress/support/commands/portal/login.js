import { SIGN_IN_TOKENS } from '../../../fixtures/constants';

const relative = require('../../relativeURL');
const signInLink = require('../../../e2e/pages/login/sign-in-link');

const login = ({ username, password }) => {
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  cy.enterUsernameAndPassword({ username, password });

  cy.url().should('eq', relative('/login/check-your-email'));

  const signInToken = SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;
  cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id }) => {
    signInLink.visit({ token: signInToken, userId: _id });
  });

  cy.url().should('eq', relative('/dashboard/deals/0'));
};

export default login;
