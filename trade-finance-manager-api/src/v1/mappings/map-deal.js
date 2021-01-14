const CONTENT_STRINGS = require('../content-strings');

const mapDeal = (deal) => {
  const mappedDeal = deal;

  mappedDeal.eligibility.criteria.map((criterion) => {
    const mappedCriterion = criterion;
    const { id } = mappedCriterion;

    mappedCriterion.description = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].description;
    mappedCriterion.descriptionList = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].descriptionList;

    return mappedCriterion;
  });

  mappedDeal.facilities = [
    ...deal.bondTransactions.items,
    ...deal.loanTransactions.items,
  ];

  delete mappedDeal.bondTransactions.items;
  delete mappedDeal.loanTransactions.items;

  return mappedDeal;
};

module.exports = mapDeal;
