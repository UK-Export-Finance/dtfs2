const CONTENT_STRINGS = require('../content-strings');
const api = require('../api');

const mapDeal = async (deal) => {
  if (deal.dealType === 'GEF') {
    return deal;
  }

  const mappedDeal = JSON.parse(JSON.stringify(deal));

  mappedDeal.eligibility.criteria.map((criterion) => {
    const mappedCriterion = criterion;
    const { id } = mappedCriterion;

    mappedCriterion.description = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].description;
    mappedCriterion.descriptionList = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].descriptionList;

    return mappedCriterion;
  });

  mappedDeal.facilities = await Promise.all(deal.facilities.map(async (facilityId) => api.findOneFacility(facilityId)));
  delete mappedDeal.bondTransactions.items;
  delete mappedDeal.loanTransactions.items;

  return mappedDeal;
};

module.exports = mapDeal;
