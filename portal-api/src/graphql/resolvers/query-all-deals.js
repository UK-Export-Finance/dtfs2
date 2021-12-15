const { findAllPaginatedDeals, findAllDeals } = require('../../v1/controllers/deal.controller');
const { dbHelpers } = require('./helpers');
const dealsReducer = require('../reducers/deals');

const queryAllDeals = async (_, { params = {} }, ctx) => {
  const {
    start = 0, pagesize, filters = [], sort = [],
  } = params;

  const dbFilters = filters.map((clause) => ({
    [clause.field]: clause.operator ? dbHelpers.createDbQuery(clause.operator, clause.value) : clause.value,
  }));

  const deals = pagesize
    ? await findAllPaginatedDeals(ctx.user, start, pagesize, dbFilters, sort)
    : await findAllDeals(ctx.user, dbFilters, sort);

  if (!deals.length) {
    return {
      deals: [],
      count: 0,
    };
  }

  const [dealsObj] = deals;
  const {
    deals: dealsArray,
    count,
  } = dealsObj;

  const reducedDeals = dealsReducer(dealsArray);

  return {
    deals: reducedDeals,
    count,
  };
};

module.exports = queryAllDeals;
