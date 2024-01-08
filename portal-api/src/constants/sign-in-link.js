const maxSignInLinkSendCount = 3;
const signInLinkDurationMinutes = 30;

module.exports = {
  MAX_SEND_COUNT: maxSignInLinkSendCount,
  DURATION_MINUTES: signInLinkDurationMinutes,
  DURATION_MILLISECONDS: signInLinkDurationMinutes * 60 * 1000,
};
