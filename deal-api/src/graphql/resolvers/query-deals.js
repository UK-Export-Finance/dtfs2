const { findPaginatedDeals, findDeals } = require('../../v1/controllers/deal.controller');

const { dbHelpers } = require('./helpers');

const queryDeals = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  const dbFilters = filters.reduce((filterList, f) => ({
    ...filterList,
    [f.field]: f.operator ? dbHelpers.createDbQuery(f.operator, f.value) : f.value,
  }), {});

  const deals = pagesize
    ? await findPaginatedDeals(ctx.user, start, pagesize, dbFilters)
    : await findDeals(ctx.user, dbFilters);

  return deals;
};

module.exports = queryDeals;
