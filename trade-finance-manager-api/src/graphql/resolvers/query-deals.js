const dealsReducer = require('../reducers/deals');
const { queryDeals } = require('../../v1/api');

require('dotenv').config();

const getDeals = async (queryParams) => {
  const { deals } = await queryDeals({ queryParams });

  const { sortBy } = queryParams;

  const reducedDeals = dealsReducer(deals, sortBy);

  return reducedDeals;
};

module.exports = getDeals;
