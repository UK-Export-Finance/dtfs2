const { getDeal, logIn } = require('./api');

/**
 * Get a deal from the portal API
 * @param {string} deal id
 * @param {object} userDetails
 * @returns {Promise<object>} an object deal from the API
 */
export const getOneDeal = (dealId, userDetails) => {
  logIn(userDetails).then((token) => {
    getDeal(dealId, token).then((deal) => deal);
  });
};
