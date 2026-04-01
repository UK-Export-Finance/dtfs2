/**
 * Set the user's sign-in OTP to an expired token (31 minutes in the past) via a Cypress task.
 * This allows E2E tests to verify that the application correctly detects and handles expired OTPs.
 * Usage: cy.overridePortalUserSignInOTPWithExpiredTokenByUsername({ username })
 */
module.exports = ({ username }) => cy.task('overridePortalUserSignInOTPWithExpiredTokenByUsername', { username });
