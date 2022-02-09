const { getUser } = require('./api');

module.exports = (username) => {
  console.info('getUser::');
  getUser(username);
};
