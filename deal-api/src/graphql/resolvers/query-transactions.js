const { findPaginatedTransactions, findTransactions } = require('../../v1/controllers/transactions.controller');

const { dbHelpers } = require('./helpers');

const queryTransactions = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  const dbFilters = filters.reduce((filterList, f) => ({
    ...filterList,
    [f.field]: f.operator ? dbHelpers.createDbQuery(f.operator, f.value) : f.value,
  }), {});

  const deals = pagesize
    ? await findPaginatedTransactions(ctx.user, start, pagesize, dbFilters)
    : await findTransactions(ctx.user, dbFilters);

  return deals;
};

module.exports = queryTransactions;
