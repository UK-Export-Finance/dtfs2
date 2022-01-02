const { listAllUsers } = require('./api');

module.exports = (id, status, opts) => {
  console.log('listAllUsers::');

  listAllUsers().then((users) => users);
};
