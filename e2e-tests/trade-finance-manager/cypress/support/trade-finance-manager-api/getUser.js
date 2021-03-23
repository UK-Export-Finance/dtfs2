const { getUser } = require('./api');

module.exports = (username) => {
  getUser(username);
};
