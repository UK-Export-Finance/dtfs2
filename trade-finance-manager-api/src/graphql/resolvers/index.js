const queryDeals = require('./query-deals');
const queryDeal = require('./query-deal');
const queryFacility = require('./query-facility');

const updateParties = require('./mutation-update-parties');
const updateFacility = require('./mutation-update-facility');


const resolvers = {
  Query: {
    deal: (root, args) => queryDeal(args),
    deals: (root, args) => queryDeals(args),
    facility: (root, args) => queryFacility(args),
  },
  Mutation: {
    updateParties: (root, args) => updateParties(args),
    updateFacility: (root, args) => updateFacility(args),
  },
};

module.exports = resolvers;
