module.exports = ({ username, newSignInToken }) => cy.task('overrideUserSignInTokenByUsername', { username, newSignInToken });
