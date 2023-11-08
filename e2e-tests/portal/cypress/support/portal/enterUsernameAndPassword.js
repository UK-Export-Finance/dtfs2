const { signInLink } = require('../../e2e/pages');
const relative = require('../../e2e/relativeURL');

module.exports = ({ username, password }) => {
<<<<<<<< HEAD:e2e-tests/portal/cypress/support/portal/enterUsernameAndPassword.js
  pages.landingPage.visit();
  pages.landingPage.email().type(username);
  pages.landingPage.password().type(password);
  pages.landingPage.login().click();
========
  cy.enterUsernameAndPassword({ username, password });

  if (Cypress.env('DTFS_FF_MAGIC_LINK')) {
    cy.url().should('eq', relative('/login/check-your-email'));

    const signInToken = 'a-test-token';
    cy.overrideUserSignInTokenByUsername({ username, newSignInToken: signInToken });
    signInLink.visitWithToken(signInToken);
  }

  cy.url().should('eq', relative('/dashboard/deals/0'));
>>>>>>>> b8c708cd6 (feat(DTFS2-6777): add e2e tests for sign in link):e2e-tests/portal/cypress/support/portal/logIn.js
};
