const { postPortalUser } = require('./create-user.controller');
const { getPortalUserById, getPortalUsers } = require('./get-user.controller');

module.exports = {
  postPortalUser,
  getPortalUserById,
  getPortalUsers,
};
