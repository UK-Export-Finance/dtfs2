const mapUserData = (user) => ({
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  timezone: user.timezone,
  teams: user.teams,
  lastLogin: user.lastLogin,
  status: user.status,
  _id: user._id,
});

module.exports = {
  mapUserData,
};
