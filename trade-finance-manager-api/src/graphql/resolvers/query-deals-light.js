const { dealsLightReducer } = require('../reducers/deals-light');
const { findTfmDealsLight } = require('../../v1/controllers/deal.controller');

const getDealsLight = async (queryParams) => {
  const { deals } = await findTfmDealsLight(queryParams);

  const reducedDeals = dealsLightReducer(deals);

  return reducedDeals;
};

module.exports = getDealsLight;
