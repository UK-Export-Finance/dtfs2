const { updateAmendment, login } = require('./api');
const { PIM_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

/**
 * update amendment from tfm-api
 * @param {string} facilityId
 * @param {string} amendmentId
 * @param {Object} update
 * @returns {Object} response
 */
module.exports = (facilityId, amendmentId, update) => {
  console.info('updateAmendment::');
  const { username, password } = PIM_USER_1;

  return login(username, password).then((token) => updateAmendment(facilityId, amendmentId, update, token));
};
