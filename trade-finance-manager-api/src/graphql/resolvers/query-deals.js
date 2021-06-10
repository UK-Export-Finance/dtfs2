const dealsReducer = require('../reducers/deals');
const { queryDeals } = require('../../v1/api');

require('dotenv').config();

const getDeals = async (queryParams) => {
  const { deals } = await queryDeals({ queryParams });

  const reducedDeals = dealsReducer(deals);

  return reducedDeals;
};

module.exports = getDeals;
