const maxSignInLinkSendCount = 3;
const signInLinkDurationMinutes = 30;
const tokenByteLength = 32;

module.exports = {
  MAX_SEND_COUNT: maxSignInLinkSendCount,
  DURATION_MINUTES: signInLinkDurationMinutes,
  DURATION_MILLISECONDS: signInLinkDurationMinutes * 60 * 1000,
  /**
   * STATUS:
   * NOT_FOUND -- not in database
   * EXPIRED -- Either the token is not the latest, or the tokens expiry has passed.
   * VALID -- Token is both in date and the latest token sent
   * */
  STATUS: { NOT_FOUND: 'Not Found', EXPIRED: 'Expired', VALID: 'Valid' },
  TOKEN_BYTE_LENGTH: tokenByteLength,
  TOKEN_HEX_LENGTH: tokenByteLength * 2,
};
