const mapDeal = require('../mappings/map-deal');
const api = require('../api');

const findOneDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }
  return mapDeal(deal);
};

exports.findOneDeal = findOneDeal;
