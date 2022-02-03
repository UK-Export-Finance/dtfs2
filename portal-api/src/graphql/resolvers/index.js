const allDeals = require('./query-all-deals');
const allFacilities = require('./query-all-facilities');

const resolvers = {
  Query: {
    allDeals,
    allFacilities,
  },
};

module.exports = resolvers;
