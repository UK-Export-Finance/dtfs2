const { getFacility, logIn } = require('./api');

/**
 * gets facility from database
 * @param {string} dealId
 * @param {string} facilityId
 * @param {object} opts - login details such as username, password, email
 */
module.exports = (dealId, facilityId, opts) => {
  console.info('getting deal::');

  logIn(opts).then((token) => {
    getFacility(dealId, facilityId, token).then(({ facility }) => facility);
  });
};
