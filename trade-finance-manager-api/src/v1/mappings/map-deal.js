const CONSTANTS = require('../../constants');
const mapEligibilityCriteriaContentStrings = require('./map-eligibility-criteria-content-strings');
const api = require('../api');

/*
* 1) Get facilities associated with a deal
* 2) Map eligibility criteria content strings.
*/
const mapDeal = async (deal) => {
  const mappedDeal = JSON.parse(JSON.stringify(deal));

  mappedDeal.eligibility.criteria = mapEligibilityCriteriaContentStrings(
    mappedDeal.eligibility,
    deal.dealType,
  );

  if (deal.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const allFacilityIds = deal.facilities.map((facility) => facility._id);

    mappedDeal.facilities = await Promise.all(allFacilityIds.map((facilityId) => api.findOneFacility(facilityId)));

    // Remove BSS transactions arrays. This is not used in TFM, only in BSS.
    delete mappedDeal.bondTransactions.items;
    delete mappedDeal.loanTransactions.items;
  }

  if (deal.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal.facilities = await api.findFacilitesByDealId(deal._id);
  }

  return mappedDeal;
};

module.exports = mapDeal;
