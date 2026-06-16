const CONSTANTS = require('../../../../constants');

const mapDeals = (deals, mapBssDealFunc, mapGefDealFunc) => {
  try {
    if (!deals?.length) {
      return [];
    }

    const dealIds = deals.map((deal) => deal._id).join(', ');

    console.info('Mapping %s deals: %s', deals.length, dealIds);

    return deals.map((deal) => {
      const { dealType } = deal.dealSnapshot;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        return mapGefDealFunc(deal);
      }

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        return mapBssDealFunc(deal);
      }

      return deal;
    });
  } catch (error) {
    console.error('Error mapping deal for GQL reducer %o', error);
    return null;
  }
};

module.exports = mapDeals;
