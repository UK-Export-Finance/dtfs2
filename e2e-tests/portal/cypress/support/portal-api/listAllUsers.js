const { listAllUsers, logIn } = require('./api');

module.exports = (opts) => {
  console.info('listAllUsers::');

  logIn(opts)
    .then((token) => listAllUsers(token))
    .then((users) => users);
};
