const CONSTANTS = require('../../constants');
const CONTENT_STRINGS = require('../content-strings');
const api = require('../api');

/*
 * 1) Get facilities associated with a deal
 * 2) Map eligibility criteria content strings
 */
const mapDeal = async (deal) => {
  const mappedDeal = JSON.parse(JSON.stringify(deal));

  if (deal.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    mappedDeal.eligibility.criteria.map((criterion) => {
      const mappedCriterion = criterion;
      const { id } = mappedCriterion;

      mappedCriterion.text = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].text;
      mappedCriterion.textList = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].textList;

      return mappedCriterion;
    });

    mappedDeal.facilities = await Promise.all(deal.facilities.map(async (facilityId) => api.findOneFacility(facilityId)));

    delete mappedDeal.bondTransactions.items;
    delete mappedDeal.loanTransactions.items;
  }

  if (deal.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal.facilities = await api.findFacilitesByDealId(deal._id);
  }

  return mappedDeal;
};

module.exports = mapDeal;
