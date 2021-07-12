const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefDeal = require('./mappings/gef-deal/mapGefDeal');

// TODO: add unit test
// so that when this is changed, tests fail.
const dealReducer = (deal) => {
  if (deal.dealSnapshot.dealType && deal.dealSnapshot.dealType === 'GEF') {
    return mapGefDeal(deal);
  }

  return {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: mapDealSnapshot(deal),
    tfm: mapDealTfm(deal),
  };
};

module.exports = dealReducer;
