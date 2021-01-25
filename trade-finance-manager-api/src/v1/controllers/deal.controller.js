const mapDeal = require('../mappings/map-deal');
const api = require('../api');

const findOneDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch((error) => error);

  if (deal.error) {
    return false;
  }
  return mapDeal(deal);
};

exports.findOneDeal = findOneDeal;
