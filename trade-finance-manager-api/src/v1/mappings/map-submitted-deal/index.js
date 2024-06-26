const CONSTANTS = require('../../../constants');
const mapGefDeal = require('./map-gef-deal');
const mapBssEwcsDeal = require('./map-bss-ewcs-deal');

const mapSubmittedDeal = (deal) => {
  let mappedDeal;

  const { dealType } = deal.dealSnapshot;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal = mapGefDeal(deal);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    mappedDeal = mapBssEwcsDeal(deal);
  }

  return mappedDeal;
};

module.exports = mapSubmittedDeal;
