const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapDealTfm = require('../deal/dealTfm/mapDealTfm');

const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: mapGefDealSnapshot(deal.dealSnapshot, deal.tfm),
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

module.exports = mapGefDeal;
