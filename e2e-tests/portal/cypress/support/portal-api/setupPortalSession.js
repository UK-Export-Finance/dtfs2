/**
 * Custom Cypress command to set up a portal session for E2E tests.
 * Usage: cy.setupPortalSession({ userId, numberOfSignInOtpAttemptsRemaining })
 *
 * @param {Object} sessionData - The session data to set up (userId, attemptsLeft, etc.)
 */
module.exports = (sessionData) => {
  // Assumes you have a test-only API endpoint to set up session data
  // Example: POST /api/test/setup-session with { userId, numberOfSignInOtpAttemptsRemaining }
  cy.request('POST', '/api/test/setup-session', sessionData);
};
