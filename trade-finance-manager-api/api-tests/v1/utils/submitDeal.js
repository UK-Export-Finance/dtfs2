const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');

const submitDeal = async (deal) => {
  const user = await testUserCache.initialise();

  return as(user).put(deal).to('/v1/deals/submit');
};

module.exports = submitDeal;
