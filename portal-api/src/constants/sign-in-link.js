const maxSignInLinkSendCount = 3;
const signInLinkDurationMinutes = 30;

module.exports = {
  MAX_SEND_COUNT: maxSignInLinkSendCount,
  DURATION_MINUTES: signInLinkDurationMinutes,
  DURATION_MILLISECONDS: signInLinkDurationMinutes * 60 * 1000,
  // NOT_FOUND -- not in database
  // EXPIRED -- Either the token is not the latest, or the tokens expiry has passed.
  // VALID -- Token is both in date and the latest token sent
  STATUS: { NOT_FOUND: 'Not Found', EXPIRED: 'Expired', VALID: 'Valid' },
};
