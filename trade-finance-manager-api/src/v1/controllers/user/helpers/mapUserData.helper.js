// TODO combine this with other mapper
/**
 * Maps a user object from the database to a user object that can be returned to TFM UI
 * This strips out sensitive information not used by the frontend service
 * @param {import("@ukef/dtfs2-common").TfmUser} user
 * @returns {import("@ukef/dtfs2-common").TfmSessionUser}
 */
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
