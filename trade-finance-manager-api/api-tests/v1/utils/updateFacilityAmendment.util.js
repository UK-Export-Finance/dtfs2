const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const testUserCache = require('../../api-test-users');

const { as } = createApi(app);

const updateFacilityAmendment = async (facilityId, amendmentId, amendment) => {
  const user = await testUserCache.initialise(app);

  return as(user).put(amendment).to(`/v1/facilities/${facilityId}/amendments/${amendmentId}`);
};

module.exports = updateFacilityAmendment;
