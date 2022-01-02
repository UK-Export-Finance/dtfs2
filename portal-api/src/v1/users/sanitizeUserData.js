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
  _id: user._id,
});

const sanitizeUsers = (users) => users.map(sanitizeUser);

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
