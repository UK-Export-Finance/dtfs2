const queryDeals = require('./query-deals');
const queryTransactions = require('./query-transactions');

const resolvers = {
  Query: {
    deals: queryDeals,
    transactions: queryTransactions,
  },
};

module.exports = resolvers;
