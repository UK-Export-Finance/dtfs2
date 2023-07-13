const { MOCK_TFM_USER } = require('../../fixtures/mocks/mock-tfm-user');
const { tfmLogin, submitDealAfterUkefIds } = require('./api');

/**
 * logs into tfm to get token
 * then submits deal with UKEF IDs
 * @param {String} dealId
 * @param {String} dealType
 * @param {Object} checker
 */
const submitDealAfterUkefIdsCall = (dealId, dealType, checker) => {
  const { username, password } = MOCK_TFM_USER;

  tfmLogin(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, checker, token));
};

module.exports = submitDealAfterUkefIdsCall;
