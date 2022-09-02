const CONSTANTS = require('../../constants');
const api = require('../api');

const mapDeals = async (deals) => {
  const mappedDeals = deals;

  const result = await Promise.all(mappedDeals.map(async (d) => {
    const deal = d;

    const { dealSnapshot } = deal;

    const { dealType } = dealSnapshot;

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      dealSnapshot.facilities = await api.findFacilitesByDealId(deal._id);
      return deal;
    }

    delete deal.dealSnapshot.bondTransactions.items;
    delete deal.dealSnapshot.loanTransactions.items;

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      deal.dealSnapshot.facilities = await Promise.all(dealSnapshot.facilities.map(({ _id }) => api.findOneFacility(_id)));
    }

    return deal;
  }));

  return result;
};

module.exports = mapDeals;
