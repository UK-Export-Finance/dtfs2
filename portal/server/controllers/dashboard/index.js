const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} = require('./deals');
const {
  allFacilities,
} = require('./facilities');

const reportsController = require('./reports.controller');

module.exports = {
  allDeals,
  allFacilities,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  reportsController,
};
