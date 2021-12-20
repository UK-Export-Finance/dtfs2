const { findTransactions } = require('../../v1/controllers/transactions.controller');

const { dbHelpers } = require('./helpers');

const queryTransactions = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  const dbFilters = filters.map((f) => ({
    [f.field]: f.operator ? dbHelpers.createDbQuery(f.operator, f.value) : f.value,
  }));

  const deals = await findTransactions(ctx.user, dbFilters, start, pagesize);

  return deals;
};

module.exports = queryTransactions;
