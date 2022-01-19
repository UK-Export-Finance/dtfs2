const allDeals = require('./query-all-deals');
const gefFacilities = require('./query-gef-facilities');

const resolvers = {
  Query: {
    allDeals,
    gefFacilities,
  },
};

module.exports = resolvers;
