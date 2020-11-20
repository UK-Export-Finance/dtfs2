const queryDeal = require('./query-deal');

const resolvers = {
  Query: {
    deal: (root, args) => queryDeal(args),
  },
};

module.exports = resolvers;
