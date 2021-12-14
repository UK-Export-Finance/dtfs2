const { dealsReducer } = require('../reducers/deals');
const { findTfmDeals } = require('../../v1/controllers/deal.controller');

const getDeals = async (queryParams) => {
  const { deals } = await findTfmDeals(queryParams);

  const reducedDeals = dealsReducer(deals);

  return reducedDeals;
};

module.exports = getDeals;
