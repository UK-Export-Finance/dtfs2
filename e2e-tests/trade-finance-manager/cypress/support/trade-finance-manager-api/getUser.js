const { getUser } = require('./api');

module.exports = (username) => {
  console.log('getUser::');
  getUser(username);
};
