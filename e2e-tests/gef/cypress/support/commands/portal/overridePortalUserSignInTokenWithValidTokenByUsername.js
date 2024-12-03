module.exports = ({ username, newSignInToken }) => cy.task('overridePortalUserSignInTokenWithValidTokenByUsername', { username, newSignInToken });
