/**
 * Set the user's `signInOTPSendCount` via a Cypress task.
 * Usage: cy.overridePortalUserSignInOTPSendCountByUsername({ username, count })
 */
module.exports = ({ username, count }) => cy.task('overridePortalUserSignInOTPSendCountByUsername', { username, count });
