const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { MOCK_PORTAL_USERS } = require('../../../src/v1/__mocks__/mock-portal-users');

const submitDeal = async (deal) => {
  const user = await testUserCache.initialise();

  return as(user).put(deal).to('/v1/deals/submit');
};

module.exports.submitDeal = submitDeal;

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
  checker: MOCK_PORTAL_USERS[0],
});

module.exports.createSubmitBody = createSubmitBody
