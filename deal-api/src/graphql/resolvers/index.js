const queryDeals = require('./query-deals');

const resolvers = {
  Query: {
    deals: queryDeals,
  },
};

module.exports = resolvers;
