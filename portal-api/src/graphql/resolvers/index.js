const allDeals = require('./query-all-deals');
const deals = require('./query-deals');
const transactions = require('./query-transactions');
const gefDeals = require('./query-gef-deals');
const gefFacilities = require('./query-gef-facilities');

const resolvers = {
  Query: {
    allDeals,
    deals,
    gefDeals,
    transactions,
    gefFacilities,
  },
};

module.exports = resolvers;
