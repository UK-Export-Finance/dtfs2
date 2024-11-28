const { getDeal, logIn } = require('./api');

/**
 * User get a deal on portal
 * @param {string} deal id
 * @param {Object} userDetails
 * @returns {Promise<Object>} an object deal from the API
 */
export const getOneDeal = (dealId, userDetails) => {
  logIn(userDetails).then((token) => {
    getDeal(dealId, token).then((deal) => deal);
  });
};
