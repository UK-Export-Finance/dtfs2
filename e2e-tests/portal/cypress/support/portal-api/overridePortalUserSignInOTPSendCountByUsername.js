module.exports = ({ username, count }) => cy.task('overridePortalUserSignInOTPSendCountByUsername', { username, count });
