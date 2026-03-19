module.exports = ({ username }) => cy.task('overridePortalUserSignInOTPWithValidTokenByUsername', { username });
