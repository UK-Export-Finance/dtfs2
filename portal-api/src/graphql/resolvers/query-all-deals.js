const { queryAllDeals: queryDeals } = require('../../v1/controllers/deal.controller');

// NOTE: this graphQL resolver is only used in E2E tests.
const queryAllDeals = async (_, { params = {} }) => {
  const {
    start = 0,
    pagesize,
    filters = {},
    sort = [],
  } = params;

  const queryResults = await queryDeals(filters, sort, start, pagesize);

  if (!queryResults.length) {
    return {
      deals: [],
      count: 0,
    };
  }

  const dealsObj = queryResults[0];

  const {
    deals,
    count,
  } = dealsObj;

  return {
    deals,
    count,
  };
};

module.exports = queryAllDeals;
