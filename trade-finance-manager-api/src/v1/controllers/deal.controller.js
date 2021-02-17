const mapDeal = require('../mappings/map-deal');
const api = require('../api');

const findOneDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return {
    ...deal,
    dealSnapshot: mapDeal(deal.dealSnapshot),
  };
};
exports.findOneDeal = findOneDeal;

const findOnePortalDeal = async (dealId) => {
  const deal = await api.findOnePortalDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return deal;
};
exports.findOnePortalDeal = findOnePortalDeal;
