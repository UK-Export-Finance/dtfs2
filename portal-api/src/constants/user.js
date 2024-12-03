const STATUS = {
  BLOCKED: 'blocked',
  ACTIVE: 'active',
};

const STATUS_BLOCKED_REASON = {
  INVALID_PASSWORD: 'Too many invalid password entries',
  EXCESSIVE_SIGN_IN_LINKS: 'Too many sign in links sent',
};

const TIMEZONE = {
  DEFAULT: 'Europe/London',
};

module.exports = {
  STATUS,
  STATUS_BLOCKED_REASON,
  TIMEZONE,
};
