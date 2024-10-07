const { listAllDeals, logIn } = require('./api');

/**
 * gets all deal from database
 * @param {Object} opts - login details such as username, password, email
 */
module.exports = (opts) => {
  console.info('getting all deals::');

  logIn(opts)
    .then((token) => listAllDeals(token))
    .then((users) => users);
};
