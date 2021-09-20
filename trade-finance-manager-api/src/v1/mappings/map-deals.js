const CONSTANTS = require('../../constants');
const CONTENT_STRINGS = require('../content-strings');
const api = require('../api');

const mapDeals = async (deals) => {
  const mappedDeals = deals;

  const result = await Promise.all(mappedDeals.map(async (d) => {
    const deal = d;

    const { dealType } = deal.dealSnapshot;

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      deal.dealSnapshot.facilities = await api.findFacilitesByDealId(deal._id);
      return deal;
    }

    delete deal.dealSnapshot.bondTransactions.items;
    delete deal.dealSnapshot.loanTransactions.items;

    deal.dealSnapshot.eligibility.criteria.map((criterion) => {
      const mappedCriterion = criterion;
      const { id } = mappedCriterion;

      mappedCriterion.description = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].description;
      mappedCriterion.descriptionList = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].descriptionList;

      return mappedCriterion;
    });

    deal.dealSnapshot.facilities = await Promise.all(deal.dealSnapshot.facilities.map(async (facilityId) =>
      api.findOneFacility(facilityId)));

    return deal;
  }));

  return result;
};

module.exports = mapDeals;
