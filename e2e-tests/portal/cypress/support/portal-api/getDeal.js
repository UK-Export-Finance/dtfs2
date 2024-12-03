const { getDeal, logIn } = require('./api');

/**
 * gets deal from database from dealId
 * @param {string} dealId
 * @param {Object} opts - login details such as username, password, email
 */
module.exports = (dealId, opts) => {
  console.info('getting deal::');

  logIn(opts).then((token) => {
    getDeal(dealId, token).then(({ deal }) => deal);
  });
};
