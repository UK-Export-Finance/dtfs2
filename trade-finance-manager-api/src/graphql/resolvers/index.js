const queryDeal = require('./query-deal');

const resolvers = {
  Query: {
    deal: queryDeal,
  },
};

module.exports = resolvers;
