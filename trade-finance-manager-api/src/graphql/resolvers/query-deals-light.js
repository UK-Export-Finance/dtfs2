const { dealsLightReducer } = require('../reducers/deals-light');
const { findTfmDealsLight } = require('../../v1/controllers/deal.controller');

require('dotenv').config();

const getDealsLight = async (queryParams) => {
  console.log('getDealsLight..... queryParams \n', queryParams);
  const { deals } = await findTfmDealsLight(queryParams);

  const reducedDeals = dealsLightReducer(deals);

  return reducedDeals;
};

module.exports = getDealsLight;
