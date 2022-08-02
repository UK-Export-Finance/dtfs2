const CONSTANTS = require('../../constants');
const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefDeal = require('./mappings/gef-deal/mapGefDeal');

const dealReducer = async (deal) => {
  if (deal.dealSnapshot.dealType && deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return mapGefDeal(deal);
  }

  return {
    _id: deal._id,
    dealSnapshot: await mapDealSnapshot(deal),
    tfm: mapDealTfm(deal),
  };
};

module.exports = dealReducer;
