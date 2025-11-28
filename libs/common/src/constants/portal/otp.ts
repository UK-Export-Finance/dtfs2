const signInLinkDurationMinutes = 30;

export const OTP = {
  DIGITS: 6,
  SIGN_IN_LINK_DURATION_MINUTES: signInLinkDurationMinutes,
  DURATION_MILLISECONDS: signInLinkDurationMinutes * 60 * 1000,
  MAX_SIGN_IN_ATTEMPTS: 3,
};

export const STATUS_BLOCKED_REASON = {
  EXCESSIVE_SIGN_IN_OTPS: 'Too many sign in OTPs sent',
};
