const CONSTANTS = require('../../../../constants');

const mapDeals = (
  deals,
  mapBssDealFunc,
  mapGefDealFunc,
) => {
  try {
    const mappedDeals = deals.map((deal) => {
      const { dealType } = deal.dealSnapshot;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        return mapGefDealFunc(deal);
      }

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        return mapBssDealFunc(deal);
      }

      return deal;
    });

    return {
      count: mappedDeals.length,
      deals: mappedDeals,
    };
  } catch (e) {
    console.error('Error mapping deal for GQL reducer: ', { e });
    return null;
  }
};

module.exports = mapDeals;
