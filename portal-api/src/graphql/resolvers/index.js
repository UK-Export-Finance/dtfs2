const allDeals = require('./query-all-deals');

const resolvers = {
  Query: {
    // NOTE: this graphQL query is only used in E2E tests.
    allDeals,
  },
};

module.exports = resolvers;
