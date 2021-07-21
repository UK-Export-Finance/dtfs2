const mapGefDealSnapshot = require('./mapGefDealSnapshot');

const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: mapGefDealSnapshot(deal.dealSnapshot),
    tfm: {},
  };

  return mapped;
};


module.exports = mapGefDeal;
