const { listAllUsers } = require('./api');

// eslint-disable-next-line no-unused-vars
module.exports = (id, status, opts) => {
  console.info('listAllUsers::');

  listAllUsers().then((users) => users);
};
