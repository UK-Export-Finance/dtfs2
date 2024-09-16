const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const { initialiseTestUsers } = require('../../api-test-users');

const { as } = createApi(app);

const updateFacilityAmendment = async (facilityId, amendmentId, amendment) => {
  const user = await initialiseTestUsers(app);

  return as(user).put(amendment).to(`/v1/facilities/${facilityId}/amendments/${amendmentId}`);
};

module.exports = updateFacilityAmendment;
