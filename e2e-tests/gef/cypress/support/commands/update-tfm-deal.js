const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');
const { tfmLogin, updateTfmDeal } = require('./api');

/**
 * Updates a TFM deal by logging in with T1_USER_1 credentials and sending an update request.
 *
 * @param {string} dealId - The unique identifier of the deal to update.
 * @param {Object} body - The request payload containing the updated deal data.
 */
const putTfmDeal = (dealId, body) => {
  const { username, password } = T1_USER_1;

  tfmLogin(username, password).then((token) => updateTfmDeal(dealId, token, body));
};

module.exports = putTfmDeal;
