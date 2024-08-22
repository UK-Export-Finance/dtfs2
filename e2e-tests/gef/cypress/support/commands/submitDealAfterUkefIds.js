const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');
const { tfmLogin, submitDealAfterUkefIds } = require('./api');

/**
 * logs into tfm to get token
 * then submits deal with UKEF IDs
 * @param {string} dealId
 * @param {string} dealType
 * @param {object} checker
 */
const submitDealAfterUkefIdsCall = (dealId, dealType, checker) => {
  const { username, password } = T1_USER_1;

  tfmLogin(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, checker, token));
};

module.exports = submitDealAfterUkefIdsCall;
