const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapDealTfm = require('../deal/dealTfm/mapDealTfm');

const mapGefDeal = async (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: await mapGefDealSnapshot(deal.dealSnapshot, deal.tfm),
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

module.exports = mapGefDeal;
