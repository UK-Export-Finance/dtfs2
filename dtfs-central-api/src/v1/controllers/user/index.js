const { createUserPost } = require('./create-user.controller');
const { findOnePortalUserGet, listAllPortalUsers } = require('./get-user.controller');

module.exports = {
  createUserPost,
  findOnePortalUserGet,
  listAllPortalUsers,
};
