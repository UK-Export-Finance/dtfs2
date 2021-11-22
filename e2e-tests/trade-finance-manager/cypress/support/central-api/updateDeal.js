const { updateDeal } = require('./api');

module.exports = (dealId, dealUpdate) =>
     updateDeal(dealId, dealUpdate);
