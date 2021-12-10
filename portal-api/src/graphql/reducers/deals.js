const CONSTANTS = require('../../constants');
const mapGefDeal = require('../mappings/map-gef-deal');

const dealsReducer = (deals) => {
  const mappedDeals = deals.map((deal) => {
    const { dealType } = deal;

    if (dealType === CONSTANTS.DEAL.DEAL_TYPE.GEF) {
      return mapGefDeal(deal);
    }

    return deal;
  });

  return mappedDeals;
};

module.exports = dealsReducer;
