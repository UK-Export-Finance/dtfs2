const app = require('../../../src/createApp');
const api = require('../../api')(app);

const submitDeal = (deal) => api.put(deal).to('/v1/deals/submit');

module.exports = submitDeal;
