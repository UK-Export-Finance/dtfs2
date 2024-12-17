const { getGefDeal, logIn } = require('./api');

/**
 * Get a Gef deal from the portal API
 * @param {string} deal id
 * @param {Object} userDetails
 * @returns {Promise<Object>} an object deal from the API
 */
export const getOneGefDeal = (dealId, userDetails) => {
  logIn(userDetails).then((token) => {
    getGefDeal(dealId, token).then((deal) => deal);
  });
};
