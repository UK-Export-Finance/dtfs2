const app = require('../../server/createApp');
const { createApi } = require('../api');
const { initialiseTestUsers } = require('../api-test-users');

const { as } = createApi(app);

module.exports.updateFacilityAmendment = async (facilityId, amendmentId, amendment) => {
  const testUsers = await initialiseTestUsers(app);
  const user = testUsers().one();

  return as(user).put(amendment).to(`/v1/facilities/${facilityId}/amendments/${amendmentId}`);
};
