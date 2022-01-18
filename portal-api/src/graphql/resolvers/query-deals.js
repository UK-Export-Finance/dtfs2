const { findPaginatedDeals, findDeals } = require('../../v1/controllers/deal.controller');

const { reportsDbHelpers } = require('./helpers');

const queryDeals = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  const dbFilters = filters.map((clause) => ({
    [clause.field]: clause.operator ? reportsDbHelpers.createDbQuery(clause.operator, clause.value) : clause.value,
  }));

  const deals = pagesize
    ? await findPaginatedDeals(ctx.user, dbFilters, start, pagesize)
    : await findDeals(ctx.user, dbFilters);

  return deals;
};

module.exports = queryDeals;
