const { signInLink } = require('../../e2e/pages');
const relative = require('../../e2e/relativeURL');

module.exports = ({ username, password }) => {
  cy.enterUsernameAndPassword({ username, password });

  if (Cypress.env('DTFS_FF_MAGIC_LINK')) {
    cy.url().should('eq', relative('/login/check-your-email'));

    const signInToken = 'a-test-token';
    cy.overrideUserSignInTokenByUsername({ username, newSignInToken: signInToken });
    signInLink.visitWithToken(signInToken);
  }
};
