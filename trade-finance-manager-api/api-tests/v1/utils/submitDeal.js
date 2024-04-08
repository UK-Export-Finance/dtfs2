const { generatePortalUserInformation } = require('@ukef/dtfs2-common/src/helpers/changeStream/generateUserInformation');
const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const { MOCK_PORTAL_USERS } = require('../../../src/v1/__mocks__/mock-portal-users');

const submitDeal = async (deal) => {
  const user = await testUserCache.initialise(app);

  return as(user).put(deal).to('/v1/deals/submit');
};

module.exports.submitDeal = submitDeal;

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
  userInformation: generatePortalUserInformation(MOCK_PORTAL_USERS[0]._id),
});

module.exports.createSubmitBody = createSubmitBody
