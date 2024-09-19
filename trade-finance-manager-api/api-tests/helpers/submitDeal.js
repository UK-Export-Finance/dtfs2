const app = require('../../src/createApp');
const { createApi } = require('../api');
const { initialiseTestUsers } = require('../api-test-users');
const { MOCK_PORTAL_USERS } = require('../../src/v1/__mocks__/mock-portal-users');

const { as } = createApi(app);

const submitDeal = async (deal) => {
  const testUsers = await initialiseTestUsers(app);
  const user = testUsers().one();

  return as(user).put(deal).to('/v1/deals/submit');
};

module.exports.submitDeal = submitDeal;

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
  checker: MOCK_PORTAL_USERS[0],
});

module.exports.createSubmitBody = createSubmitBody;
