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
  _id: user._id, // eslint-disable-line no-underscore-dangle
});

const sanitizeUsers = (users) => users.map(sanitizeUser);

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
