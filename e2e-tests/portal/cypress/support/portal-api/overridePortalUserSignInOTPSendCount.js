/**
 * Set the user's `signInOTPSendCount` via a Cypress task.
 * Usage: cy.overridePortalUserSignInOTPSendCount({ username, count })
 */
module.exports = ({ username, count }) => cy.task('overridePortalUserSignInOTPSendCount', { username, count });
