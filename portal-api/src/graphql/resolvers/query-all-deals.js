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

  const dealsArray = deals[0].deals;
  const count = deals[0].count;
 
  const reducedDeals = dealsReducer(dealsArray);

  return {
    deals: reducedDeals,
    count: count,
  };
};

module.exports = queryAllDeals;
