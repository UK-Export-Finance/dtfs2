const sanitizeUser = (user) => ({
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  _id: user._id, // eslint-disable-line no-underscore-dangle
});

const sanitizeUsers = (users) => users.map(sanitizeUser);

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
