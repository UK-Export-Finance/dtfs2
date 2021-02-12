const dealsReducer = require('../reducers/deals');
const { queryDeals } = require('../../v1/api');
require('dotenv').config();

const getDeals = async (args) => {
  const deals = await queryDeals(args);
  const reducedDeals = dealsReducer(deals);

  return reducedDeals;
};

module.exports = getDeals;
