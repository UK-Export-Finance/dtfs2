const { listAllUsers } = require('./api');

module.exports = (id, status, opts) => {
  console.info('listAllUsers::');

  listAllUsers().then((users) => users);
};
