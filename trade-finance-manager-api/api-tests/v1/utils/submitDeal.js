const app = require('../../../src/createApp');
const api = require('../../api')(app);

const submitDeal = async (deal) => {
  await api.put(deal).to('/v1/deals/submit');
  return api.put(deal).to('/v1/deals/submitDealAfterUkefIds');
};

module.exports = submitDeal;
