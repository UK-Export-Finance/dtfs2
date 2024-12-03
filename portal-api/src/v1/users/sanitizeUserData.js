const sanitizeUser = (user) => ({
  username: user.username,
  firstname: user.firstname,
  surname: user.surname,
  email: user.email,
  roles: user.roles,
  bank: user.bank,
  timezone: user.timezone,
  lastLogin: user.lastLogin,
  'user-status': user['user-status'],
  disabled: user.disabled,
  isTrusted: user.isTrusted,
  signInLinkSendDate: user.signInLinkSendDate,
  signInLinkSendCount: user.signInLinkSendCount,
  _id: user._id,
});

const sanitizeUsers = (users) => users.map(sanitizeUser);

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
