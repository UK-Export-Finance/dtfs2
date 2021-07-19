
const queryAllDeals = require('./query-all-deals');
const queryDeals = require('./query-deals');
const queryTransactions = require('./query-transactions');

const resolvers = {
  Query: {
    allDeals: queryAllDeals,
    deals: queryDeals,
    transactions: queryTransactions,
  },
};

module.exports = resolvers;
