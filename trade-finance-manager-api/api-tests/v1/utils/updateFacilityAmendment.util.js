const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');

const updateFacilityAmendment = async (facilityId, amendmentId, amendment) => {
  const user = await testUserCache.initialise();

  return as(user).put(amendment).to(`/v1/facilities/${facilityId}/amendments/${amendmentId}`);
};

module.exports = updateFacilityAmendment;
