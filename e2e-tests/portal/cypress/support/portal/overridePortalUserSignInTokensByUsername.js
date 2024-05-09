module.exports = ({ username, newSignInTokens }) => cy.task('overridePortalUserSignInTokensByUsername', { username, newSignInTokens });
