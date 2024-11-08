const { ROLES } = require('@ukef/dtfs2-common');
const { signInLink } = require('../../../../portal/cypress/e2e/pages');
const { SIGN_IN_TOKENS } = require('../../../../portal/cypress/fixtures/constants');
const relative = require('../../e2e/relativeURL');

module.exports = (opts) => {
  const { username, password, roles } = opts;
  cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
  cy.enterUsernameAndPassword({ username, password });

  cy.url().should('eq', relative('/login/check-your-email'));

  const signInToken = SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;
  cy.overridePortalUserSignInTokenWithValidTokenByUsername({ username, newSignInToken: signInToken });
  cy.getUserByUsername(username).then(({ _id }) => {
    signInLink.visit({ token: signInToken, userId: _id });
  });

  if (roles?.length === 1 && roles?.at(0) === ROLES.PAYMENT_REPORT_OFFICER) {
    cy.url().should('eq', relative('/utilisation-report-upload'));
  } else {
    cy.url().should('eq', relative('/dashboard/deals/0'));
  }
};
