const { signInLink } = require('../../e2e/pages');
const relative = require('../../e2e/relativeURL');

module.exports = ({ username, password }) => {
  cy.resetUserStatusAndNumberOfSignInLinks(username);
  cy.enterUsernameAndPassword({ username, password });

  if (Cypress.env('DTFS_FF_MAGIC_LINK')) {
    cy.url().should('eq', relative('/login/check-your-email'));

    const signInToken = '6569ca7a6fd828f925e07c6e';
    cy.overrideUserSignInTokenByUsername({ username, newSignInToken: signInToken });
    cy.getUserByUsername(username).then(({ _id }) => {
      signInLink.visit({ token: signInToken, userId: _id });
    });
  }

  cy.url().should('eq', relative('/dashboard/deals/0'));
};
