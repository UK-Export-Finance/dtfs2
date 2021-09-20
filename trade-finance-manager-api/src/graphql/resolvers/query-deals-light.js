const { dealsLightReducer } = require('../reducers/deals-light');
const { queryDeals } = require('../../v1/api');

require('dotenv').config();

const getDeals = async (queryParams) => {
  const { deals } = await queryDeals({ queryParams });

  const reducedDeals = dealsLightReducer(deals);

  return reducedDeals;
};

module.exports = getDeals;
