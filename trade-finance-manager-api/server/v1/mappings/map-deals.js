const CONSTANTS = require('../../constants');
const api = require('../api');

const mapDeals = async (deals) => {
  const mappedDeals = deals;

  const result = await Promise.all(
    mappedDeals.map(async (deal) => {
      const modifiedDeal = deal;

      const { dealSnapshot } = modifiedDeal;

      const { dealType } = dealSnapshot;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        dealSnapshot.facilities = await api.findFacilitiesByDealId(deal._id);
        return modifiedDeal;
      }

      delete modifiedDeal.dealSnapshot.bondTransactions.items;
      delete modifiedDeal.dealSnapshot.loanTransactions.items;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        modifiedDeal.dealSnapshot.facilities = await Promise.all(dealSnapshot.facilities.map(({ _id }) => api.findOneFacility(_id)));
      }

      return modifiedDeal;
    }),
  );

  return result;
};

module.exports = mapDeals;
