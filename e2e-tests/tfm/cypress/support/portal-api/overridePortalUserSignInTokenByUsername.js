module.exports = ({ username, newSignInToken }) =>
  cy.task('overridePortalUserSignInTokenByUsername', { username, newSignInToken });
