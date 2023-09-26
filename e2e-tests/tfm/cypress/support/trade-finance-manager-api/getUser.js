const { getUser, login } = require('./api');

module.exports = (usernameToGet, opts) => {
  console.info('getUser::');
  const { username, password } = opts;

  return login(username, password).then((token) => getUser(usernameToGet, token));
};
