const queryDeal = require('./query-deal');
const queryFacility = require('./query-facility');

const resolvers = {
  Query: {
    deal: (root, args) => queryDeal(args),
    facility: (root, args) => queryFacility(args),
  },
};

module.exports = resolvers;
