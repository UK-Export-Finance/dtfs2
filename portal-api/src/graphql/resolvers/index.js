const allDeals = require('./query-all-deals');
const deals = require('./query-deals');
const transactions = require('./query-transactions');
const gefFacilities = require('./query-gef-facilities');

const resolvers = {
  Query: {
    allDeals,
    deals,
    transactions,
    gefFacilities,
  },
};

module.exports = resolvers;
