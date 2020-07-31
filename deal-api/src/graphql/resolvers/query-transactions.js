const { findTransactions } = require('../../v1/controllers/transactions.controller');

const { dbHelpers } = require('./helpers');

const queryTransactions = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  console.log(`graphQLResolver; filters:\n${JSON.stringify(filters, null, 2)}`);

  const dbFilters = filters.map((f) => ({
    [f.field]: f.operator ? dbHelpers.createDbQuery(f.operator, f.value) : f.value,
  }));

  console.log(`graphQLResolver; dbFilters:\n${JSON.stringify(dbFilters, null, 2)}`);

  const deals = await findTransactions(ctx.user, start, pagesize, dbFilters);

  return deals;
};

module.exports = queryTransactions;
